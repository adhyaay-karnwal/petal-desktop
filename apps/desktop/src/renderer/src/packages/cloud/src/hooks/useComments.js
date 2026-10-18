// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useComments.ts
import { import_react, useInfiniteQuery, useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { getApi } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "./useSession.js";

var commentKeys = {
	all: (projectId) => ["comments", projectId],
	page: (projectId, pageId, includeResolved) => [
		"comments",
		projectId,
		pageId,
		{ includeResolved }
	],
	thread: (commentId) => ["comment-thread", commentId]
};
/** Whole-file loads take the largest page so polling normally refetches one request, not one per page. */
var PROJECT_PAGE_SIZE = 100;
function useComments(projectId, pageId, t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	const includeResolved = t0 === void 0 ? false : t0;
	let t1;
	if ($[0] !== includeResolved || $[1] !== pageId || $[2] !== projectId) {
		t1 = commentKeys.page(projectId, pageId, includeResolved);
		$[0] = includeResolved;
		$[1] = pageId;
		$[2] = projectId;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== includeResolved || $[5] !== pageId || $[6] !== projectId) {
		t2 = async (t3) => {
			const { pageParam } = t3;
			const res = await getApi().projects[":projectId"].comments.$get({
				param: { projectId },
				query: {
					...pageId ? { pageId } : { limit: String(PROJECT_PAGE_SIZE) },
					...includeResolved ? { includeResolved: "true" } : {},
					...pageParam ? { cursor: pageParam } : {}
				}
			});
			if (!res.ok) throw new Error("Failed to load comments");
			return res.json();
		};
		$[4] = includeResolved;
		$[5] = pageId;
		$[6] = projectId;
		$[7] = t2;
	} else t2 = $[7];
	const t3 = !!projectId && pageId !== "";
	let t4;
	if ($[8] !== t1 || $[9] !== t2 || $[10] !== t3) {
		t4 = {
			queryKey: t1,
			queryFn: t2,
			refetchInterval: 1e4,
			initialPageParam: void 0,
			getNextPageParam: _temp$116,
			enabled: t3
		};
		$[8] = t1;
		$[9] = t2;
		$[10] = t3;
		$[11] = t4;
	} else t4 = $[11];
	const query = useInfiniteQuery(t4);
	const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
	let t5;
	let t6;
	if ($[12] !== fetchNextPage || $[13] !== hasNextPage || $[14] !== isFetchingNextPage) {
		t5 = () => {
			if (hasNextPage && !isFetchingNextPage) fetchNextPage();
		};
		t6 = [
			hasNextPage,
			isFetchingNextPage,
			fetchNextPage
		];
		$[12] = fetchNextPage;
		$[13] = hasNextPage;
		$[14] = isFetchingNextPage;
		$[15] = t5;
		$[16] = t6;
	} else {
		t5 = $[15];
		t6 = $[16];
	}
	(0, import_react.useEffect)(t5, t6);
	return query;
}
function _temp$116(lastPage) {
	return lastPage.nextCursor ?? void 0;
}
function useCommentThread(projectId, commentId) {
	const $ = (0, import_compiler_runtime.c)(9);
	let t0;
	if ($[0] !== commentId) {
		t0 = commentKeys.thread(commentId);
		$[0] = commentId;
		$[1] = t0;
	} else t0 = $[1];
	let t1;
	if ($[2] !== commentId || $[3] !== projectId) {
		t1 = async () => {
			const res = await getApi().projects[":projectId"].comments[":id"].replies.$get({ param: {
				projectId,
				id: commentId
			} });
			if (!res.ok) throw new Error("Failed to load replies");
			return res.json();
		};
		$[2] = commentId;
		$[3] = projectId;
		$[4] = t1;
	} else t1 = $[4];
	const t2 = !!commentId;
	let t3;
	if ($[5] !== t0 || $[6] !== t1 || $[7] !== t2) {
		t3 = {
			queryKey: t0,
			queryFn: t1,
			enabled: t2,
			refetchInterval: 1e4
		};
		$[5] = t0;
		$[6] = t1;
		$[7] = t2;
		$[8] = t3;
	} else t3 = $[8];
	return useQuery(t3);
}
var commentWriteErrors = {
	401: "Your comment session expired. Reload and enter your name again.",
	403: "Commenting is no longer allowed for this file.",
	429: "Too many comments. Try again in a minute."
};
function useCreateComment(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (input) => {
				const res = await getApi().projects[":projectId"].comments.$post({
					param: { projectId },
					json: input
				});
				if (!res.ok) throw new Error(commentWriteErrors[res.status] ?? "Couldn’t send your comment. Try again.");
				return res.json();
			},
			onSuccess: (_, input_0) => {
				queryClient.invalidateQueries({ queryKey: commentKeys.all(projectId) });
				if (input_0.parentId) queryClient.invalidateQueries({ queryKey: commentKeys.thread(input_0.parentId) });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useUpdateComment(projectId) {
	const $ = (0, import_compiler_runtime.c)(9);
	let t0;
	let t1;
	if ($[0] !== projectId) {
		t0 = async (t2) => {
			const { id, ...input } = t2;
			const res = await getApi().projects[":projectId"].comments[":id"].$patch({
				param: {
					projectId,
					id
				},
				json: input
			});
			if (!res.ok) throw new Error("Failed to update comment");
			return res.json();
		};
		t1 = async (variables) => {
			await queryClient.cancelQueries({ queryKey: commentKeys.all(projectId) });
			const snapshots = [];
			const queryCache = queryClient.getQueriesData({ queryKey: commentKeys.all(projectId) });
			for (const [key, data] of queryCache) {
				if (!data?.pages) continue;
				snapshots.push([key, data]);
				queryClient.setQueryData(key, {
					...data,
					pages: data.pages.map((page) => ({
						...page,
						items: page.items.map((c) => c.id === variables.id ? {
							...c,
							...variables
						} : c)
					}))
				});
			}
			return { snapshots };
		};
		$[0] = projectId;
		$[1] = t0;
		$[2] = t1;
	} else {
		t0 = $[1];
		t1 = $[2];
	}
	let t2;
	if ($[3] !== projectId) {
		t2 = () => {
			queryClient.invalidateQueries({ queryKey: commentKeys.all(projectId) });
			queryClient.invalidateQueries({ queryKey: ["comment-thread"] });
		};
		$[3] = projectId;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== t0 || $[6] !== t1 || $[7] !== t2) {
		t3 = {
			mutationFn: t0,
			onMutate: t1,
			onError: _temp2$77,
			onSettled: t2
		};
		$[5] = t0;
		$[6] = t1;
		$[7] = t2;
		$[8] = t3;
	} else t3 = $[8];
	return useMutation(t3);
}
function _temp2$77(_err, _variables, context) {
	if (context?.snapshots) for (const [key_0, data_0] of context.snapshots) queryClient.setQueryData(key_0, data_0);
}
function useDeleteComment(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (id) => {
				const res = await getApi().projects[":projectId"].comments[":id"].$delete({ param: {
					projectId,
					id
				} });
				if (!res.ok) throw new Error("Failed to delete comment");
				return res.json();
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: commentKeys.all(projectId) });
				queryClient.invalidateQueries({ queryKey: ["comment-thread"] });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useResolveComment(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (id) => {
				const res = await getApi().projects[":projectId"].comments[":id"].resolve.$post({ param: {
					projectId,
					id
				} });
				if (!res.ok) throw new Error("Failed to resolve comment");
				return res.json();
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: commentKeys.all(projectId) });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useUnresolveComment(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (id) => {
				const res = await getApi().projects[":projectId"].comments[":id"].unresolve.$post({ param: {
					projectId,
					id
				} });
				if (!res.ok) throw new Error("Failed to unresolve comment");
				return res.json();
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: commentKeys.all(projectId) });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useToggleReaction(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			mutationFn: async (t1) => {
				const { id, emoji } = t1;
				const res = await getApi().projects[":projectId"].comments[":id"].reactions.$post({
					param: {
						projectId,
						id
					},
					json: { emoji }
				});
				if (!res.ok) throw new Error("Failed to toggle reaction");
				return res.json();
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: commentKeys.all(projectId) });
				queryClient.invalidateQueries({ queryKey: ["comment-thread"] });
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function useCommentMentionPeople(projectId, enabled) {
	const $ = (0, import_compiler_runtime.c)(8);
	let t0;
	if ($[0] !== projectId) {
		t0 = ["comment-people", projectId];
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	let t1;
	if ($[2] !== projectId) {
		t1 = async () => {
			const res = await getApi().projects[":projectId"].comments.people.$get({ param: { projectId } });
			if (!res.ok) throw new Error("Could not load people");
			return res.json();
		};
		$[2] = projectId;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== enabled || $[5] !== t0 || $[6] !== t1) {
		t2 = {
			queryKey: t0,
			enabled,
			queryFn: t1
		};
		$[4] = enabled;
		$[5] = t0;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return useQuery(t2);
}
function useCommentAgentTransport(projectId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== projectId) {
		t0 = {
			start: async (id) => {
				const res = await getApi().projects[":projectId"].comments[":id"].agent.$post({ param: {
					projectId,
					id
				} });
				if (!res.ok) throw new Error(res.status === 409 ? "An agent already started for this comment, or this thread is busy." : "Could not start the agent. Check that you can still edit this file.");
				queryClient.invalidateQueries({ queryKey: commentKeys.all(projectId) });
				return res.json();
			},
			update: async (id_0, json) => {
				if (!(await getApi().projects[":projectId"].comments[":id"].agent.$patch({
					param: {
						projectId,
						id: id_0
					},
					json
				})).ok) throw new Error("Could not save the agent response. It is still available in the agent chat.");
				if (json.status !== "working") {
					queryClient.invalidateQueries({ queryKey: commentKeys.all(projectId) });
					queryClient.invalidateQueries({ queryKey: ["comment-thread"] });
				}
			}
		};
		$[0] = projectId;
		$[1] = t0;
	} else t0 = $[1];
	return t0;
}

export { useCommentAgentTransport, useCommentMentionPeople, useCommentThread, useComments, useCreateComment, useDeleteComment, useResolveComment, useToggleReaction, useUnresolveComment, useUpdateComment };
