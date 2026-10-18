// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/commentMentions.ts

/** Keep references through text edits; editing inside a mention turns it back into plain text. */
function moveCommentMentions(before, after, mentions, edit) {
	let start = 0;
	while (start < before.length && start < after.length && before[start] === after[start]) start++;
	let oldEnd = before.length;
	let newEnd = after.length;
	while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) {
		oldEnd--;
		newEnd--;
	}
	const delta = after.length - before.length;
	if (edit) {
		let editStart = edit.start;
		let editEnd = edit.end;
		if (editStart === editEnd && delta < 0) {
			if (edit.inputType?.endsWith("Backward")) editStart += delta;
			else if (edit.inputType?.endsWith("Forward")) editEnd -= delta;
		}
		const insertedEnd = editEnd + delta;
		if (editStart >= 0 && insertedEnd >= editStart && before.slice(0, editStart) === after.slice(0, editStart) && before.slice(editEnd) === after.slice(insertedEnd)) {
			start = editStart;
			oldEnd = editEnd;
		}
	}
	return mentions.flatMap((mention) => {
		const next = mention.end <= start ? mention : mention.start >= oldEnd ? {
			...mention,
			start: mention.start + delta,
			end: mention.end + delta
		} : null;
		return next && after.slice(next.start, next.end) === `@${next.label}` ? [next] : [];
	});
}
function commentMentionQuery(value, caret) {
	const match = /(?:^|\s)@([^@\n]{0,80})$/.exec(value.slice(0, caret));
	return match ? {
		start: caret - match[1].length - 1,
		end: caret,
		query: match[1].toLocaleLowerCase()
	} : null;
}

export { commentMentionQuery, moveCommentMentions };
