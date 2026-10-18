// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CommentMentionContext.tsx
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";

var CommentMentionContext = (0, import_react.createContext)({
	people: [],
	agentAvailable: false
});
var useCommentMentions = () => {
	return (0, import_react.useContext)(CommentMentionContext);
};

export { CommentMentionContext, useCommentMentions };
