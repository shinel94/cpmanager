import assert from "node:assert/strict";
import test from "node:test";

import { GET as listProjects, POST as createProject } from "../app/api/projects/route";
import { GET as getProject, PUT as saveProject, DELETE as deleteProject } from "../app/api/projects/[id]/route";
import { GET as getChart } from "../app/api/projects/[id]/chart/route";

const projectPayload = {
  name: "HTTP Wave 4",
  tonic: "C",
  mode: "major",
  sections: [{
    position: 0,
    name: "Verse",
    bar_count: 4,
    bars: [1, 2, 3, 4].map((position) => ({
      position,
      chords: position === 1 ? [{ beat: 1, degree: "I", quality: "major", extension: null, bass_degree: null }] : [],
    })),
  }],
};

const context = (id: number) => ({ params: Promise.resolve({ id: String(id) }) });

test("project Route Handlers provide CRUD, rehydration, and chart display names", async () => {
  const createResponse = await createProject(new Request("http://localhost/api/projects", {
    method: "POST",
    body: JSON.stringify({ name: "HTTP Wave 4", tonic: "C", mode: "major" }),
    headers: { "content-type": "application/json" },
  }));
  const createdBody = await createResponse.json();
  assert.equal(createResponse.status, 200);
  const id = createdBody.project.id as number;

  const saveResponse = await saveProject(new Request(`http://localhost/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(projectPayload),
    headers: { "content-type": "application/json" },
  }), context(id));
  const savedBody = await saveResponse.json();
  assert.equal(savedBody.project.sections[0].bars[0].id > 0, true);

  const chartResponse = await getChart(new Request(`http://localhost/api/projects/${id}/chart`), context(id));
  const chartBody = await chartResponse.json();
  assert.equal(chartBody.project.sections[0].bars[0].chords[0].displayName, "C");

  const loadedResponse = await getProject(new Request(`http://localhost/api/projects/${id}`), context(id));
  assert.equal((await loadedResponse.json()).project.name, "HTTP Wave 4");

  const listResponse = await listProjects(new Request("http://localhost/api/projects?q=Wave%204"));
  assert.equal((await listResponse.json()).items.length, 1);

  const deleteResponse = await deleteProject(new Request(`http://localhost/api/projects/${id}`, { method: "DELETE" }), context(id));
  assert.equal((await deleteResponse.json()).deleted, true);
});
