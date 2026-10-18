// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/emptyPageGuard.ts
import { getRootIds } from "../../../../compiler/src/store/read.js";

/**
* Whether saving `tree` would replace a page that has content with an empty
* one the user never emptied. A page that loaded empty while the server has
* content says nothing about the page, so it must not save. When the tree
* just before this change still had roots, the user deleted them, and that
* edit saves like any other.
*/
function isUnconfirmedEmptyPage(tree, previousTree, savedElementCount) {
	if (savedElementCount === 0 || getRootIds(tree).length > 0) return false;
	return getRootIds(previousTree).length === 0;
}

export { isUnconfirmedEmptyPage };
