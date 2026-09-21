import assert from "node:assert/strict";
import test from "node:test";

import { GET as listProjects, POST as createProject } from "../app/api/projects/route";
import { GET as getProject, PUT as saveProject, DELETE as deleteProject } from "../app/api/projects/[id]/route";
import { hydrateProjectDraft, serializeProjectDraft } from "../app/lib/client/project-serializer";
import { realizeChord } from "../app/lib/shared/domain/chord-realizer";

const context = (id: number) => ({ params: Promise.resolve({ id: String(id) }) });

test("FE Wave 2: Complete Project Lifecycle (Create, List, Rehydrate, Save, Key Change, and Delete)", async () => {
  // 1. Create Project via POST /api/projects
  const projectName = `Wave 2 Test Song ${Date.now()}`;
  const createRes = await createProject(
    new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: projectName, tonic: "Eb", mode: "major" }),
      headers: { "content-type": "application/json" },
    }),
  );
  assert.equal(createRes.status, 200);
  const createdBody = await createRes.json();
  assert.equal(createdBody.ok, true);
  const projectId = createdBody.project.id as number;
  assert.ok(projectId > 0);

  // 2. Hydrate into Client ProjectDraft
  let draft = hydrateProjectDraft(createdBody.project);
  assert.equal(draft.id, projectId);
  assert.equal(draft.name, projectName);
  assert.equal(draft.tonic, "Eb");
  assert.equal(draft.sections.length, 0);

  // 3. Populate Client Draft with Song Form and Chords
  draft = {
    ...draft,
    sections: [
      {
        id: "sec_client_1",
        position: 0,
        name: "Verse",
        bar_count: 4,
        bars: [
          {
            id: "bar_client_1",
            position: 1,
            chords: [{ id: "chord_client_1", beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }],
          },
          {
            id: "bar_client_2",
            position: 2,
            chords: [{ id: "chord_client_2", beat: 1, degree: "V", quality: "major", extension: null, bass_degree: null }],
          },
          { id: "bar_client_3", position: 3, chords: [] },
          { id: "bar_client_4", position: 4, chords: [] },
        ],
      },
    ],
  };

  // 4. Verify Derived Realization in Eb Major
  const chord1 = draft.sections[0].bars[0].chords[0];
  const chord2 = draft.sections[0].bars[1].chords[0];
  assert.equal(realizeChord(draft.tonic, chord1), "Eb");
  assert.equal(realizeChord(draft.tonic, chord2), "Bb");

  // Change Key to G Major and verify instantaneous derived realization
  assert.equal(realizeChord("G", chord1), "G");
  assert.equal(realizeChord("G", chord2), "D");

  // 5. Serialize and Save Draft via PUT /api/projects/:id
  const payload = serializeProjectDraft(draft);
  const saveRes = await saveProject(
    new Request(`http://localhost/api/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    }),
    context(projectId),
  );
  assert.equal(saveRes.status, 200);
  const savedBody = await saveRes.json();
  assert.equal(savedBody.ok, true);

  // Rehydrate after save - verifies server IDs are assigned
  draft = hydrateProjectDraft(savedBody.project);
  assert.equal(draft.sections[0].bars[0].chords[0].degree, "I");
  assert.ok(draft.sections[0].bars[0].id.length > 0);

  // 6. Search Projects via GET /api/projects?q=
  const listRes = await listProjects(
    new Request(`http://localhost/api/projects?q=${encodeURIComponent(projectName)}`),
  );
  assert.equal(listRes.status, 200);
  const listBody = await listRes.json();
  assert.equal(listBody.items.length, 1);
  assert.equal(listBody.items[0].name, projectName);
  assert.equal(listBody.items[0].tonic, "Eb");

  // 7. Load Project via GET /api/projects/:id
  const loadRes = await getProject(
    new Request(`http://localhost/api/projects/${projectId}`),
    context(projectId),
  );
  assert.equal(loadRes.status, 200);
  const loadedBody = await loadRes.json();
  assert.equal(loadedBody.project.name, projectName);
  assert.equal(loadedBody.project.sections.length, 1);
  assert.equal(loadedBody.project.sections[0].bars.length, 4);

  // 8. Delete Project via DELETE /api/projects/:id
  const deleteRes = await deleteProject(
    new Request(`http://localhost/api/projects/${projectId}`, { method: "DELETE" }),
    context(projectId),
  );
  assert.equal(deleteRes.status, 200);
  const deleteBody = await deleteRes.json();
  assert.equal(deleteBody.deleted, true);

  // Verify deletion from list
  const verifyListRes = await listProjects(
    new Request(`http://localhost/api/projects?q=${encodeURIComponent(projectName)}`),
  );
  const verifyBody = await verifyListRes.json();
  assert.equal(verifyBody.items.length, 0);
});
