"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/app/components/common/Modal";
import { ConfirmDialog } from "@/app/components/common/ConfirmDialog";
import { apiClient } from "@/app/lib/client/api";
import { useToast } from "@/app/components/common/Toast";
import { useProjectDraft } from "@/app/lib/client/project-draft-context";

export type ProjectListItem = {
  id: number;
  name: string;
  tonic: string;
  mode: string;
  created_at: string;
  updated_at: string;
};

export type ProjectListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateModal?: () => void;
};

export function ProjectListModal({
  isOpen,
  onClose,
  onOpenCreateModal,
}: ProjectListModalProps) {
  const { project, isDirty, loadProject, resetToEmpty } = useProjectDraft();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation dialogs
  const [pendingLoadId, setPendingLoadId] = useState<number | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectListItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async (query = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query.trim();
      const endpoint = q
        ? `/api/projects?q=${encodeURIComponent(q)}`
        : "/api/projects";
      const res = await apiClient.get<{ ok: true; items: ProjectListItem[] }>(
        endpoint,
      );
      setItems(res.items || []);
    } catch (err: any) {
      setError(err.message || "프로젝트 목록을 불러오지 못했습니다.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch projects when modal opens or query changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchProjects(searchQuery);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchQuery, fetchProjects]);

  const handleExecuteLoad = async (id: number) => {
    try {
      const res = await apiClient.get<{ ok: true; project: any }>(
        `/api/projects/${id}`,
      );
      loadProject(res.project);
      toast.success(`'${res.project.name}' 프로젝트를 불러왔습니다.`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "프로젝트를 불러오지 못했습니다.");
    } finally {
      setPendingLoadId(null);
    }
  };

  const handleSelectProject = (item: ProjectListItem) => {
    if (String(item.id) === String(project.id)) {
      toast.info("이미 현재 열려 있는 프로젝트입니다.");
      return;
    }

    if (isDirty) {
      setPendingLoadId(item.id);
    } else {
      handleExecuteLoad(item.id);
    }
  };

  const handleExecuteDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/projects/${projectToDelete.id}`);
      toast.success(`'${projectToDelete.name}' 프로젝트가 삭제되었습니다.`);

      // If the deleted project was the currently opened project, reset to empty
      if (String(projectToDelete.id) === String(project.id)) {
        resetToEmpty("새 프로젝트", "C");
      }

      setProjectToDelete(null);
      fetchProjects(searchQuery);
    } catch (err: any) {
      toast.error(err.message || "프로젝트 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
        d.getDate(),
      ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes(),
      ).padStart(2, "0")}`;
    } catch {
      return isoString;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="프로젝트 목록"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateModal?.();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>새 프로젝트 만들기</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              닫기
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="곡 이름으로 검색..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[380px] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <span className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                <span>프로젝트를 불러오는 중...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-xs text-red-500">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {searchQuery
                  ? `'${searchQuery}'에 일치하는 프로젝트가 없습니다.`
                  : "저장된 프로젝트가 없습니다. 새 프로젝트를 생성해 보세요."}
              </div>
            ) : (
              items.map((item) => {
                const isCurrent = String(item.id) === String(project.id);
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 flex items-center justify-between transition ${
                      isCurrent ? "bg-indigo-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {item.name}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700">
                            현재 열림
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {item.tonic} Major
                        </span>
                        <span>·</span>
                        <span>최종 수정: {formatDate(item.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectProject(item)}
                        disabled={isCurrent}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                          isCurrent
                            ? "bg-slate-100 text-slate-400 cursor-default"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer"
                        }`}
                      >
                        {isCurrent ? "편집 중" : "열기"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setProjectToDelete(item)}
                        className="px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="프로젝트 삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Dirty Warning Confirm Dialog when loading another project */}
      <ConfirmDialog
        isOpen={pendingLoadId !== null}
        onClose={() => setPendingLoadId(null)}
        onConfirm={() => {
          if (pendingLoadId !== null) {
            handleExecuteLoad(pendingLoadId);
          }
        }}
        title="저장되지 않은 변경사항 있음"
        message="현재 프로젝트에 저장되지 않은 변경사항이 있습니다. 다른 프로젝트를 열면 현재 변경사항은 유실됩니다. 계속하시겠습니까?"
        confirmText="불러오기 (변경사항 폐기)"
        variant="danger"
      />

      {/* Delete Project Confirm Dialog */}
      <ConfirmDialog
        isOpen={projectToDelete !== null}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleExecuteDelete}
        title="프로젝트 삭제 확인"
        message={`'${projectToDelete?.name}' 프로젝트를 정말 삭제하시겠습니까? 하위 송폼 및 모든 코드 데이터가 영구적으로 삭제되며 복구할 수 없습니다.`}
        confirmText={isDeleting ? "삭제 중..." : "삭제하기"}
        variant="danger"
      />
    </>
  );
}
