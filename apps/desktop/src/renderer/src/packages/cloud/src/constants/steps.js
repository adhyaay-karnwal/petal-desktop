// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/constants/steps.ts
import { c$11, c$6, c$7, f$3, i$7, m$5, m$9, n$10, n$13, n$14, n$15, n$17, n$2, n$4, n$5, n$6, s$3, s$6 } from "../../../../vendor/@phosphor-icons/react.js";
import { ClaudeLogo, CodexLogo, CursorLogo, FigmaLogo } from "../components/icons.js";

/** Six onboarding steps. Agent setup and import guidance live in the dashboard tour. */
var ONBOARDING_STEPS = [
	{
		key: "role",
		title: "What best describes you?",
		subtitle: "We'd love to build Petal for you",
		groups: [{
			key: "role",
			multi: true,
			options: [
				{
					id: "designer",
					label: "Designer",
					Icon: c$7
				},
				{
					id: "engineer",
					label: "Engineer",
					Icon: n$17
				},
				{
					id: "design-engineer",
					label: "Design engineer",
					Icon: m$5
				},
				{
					id: "founder",
					label: "Founder",
					Icon: n$6
				},
				{
					id: "web-developer",
					label: "Web developer",
					Icon: n$14
				}
			]
		}]
	},
	{
		key: "goals",
		title: "What will you make here?",
		subtitle: "Select all that apply.",
		groups: [{
			key: "goals",
			multi: true,
			options: [
				{
					id: "product-ui-ux",
					label: "Product UI/UX",
					Icon: n$13
				},
				{
					id: "website-design",
					label: "Website design",
					Icon: n$14
				},
				{
					id: "creative-coding",
					label: "Creative coding & art",
					Icon: n$10
				},
				{
					id: "side-project",
					label: "A side project",
					Icon: s$3
				},
				{
					id: "work-company",
					label: "Work for my company",
					Icon: i$7
				},
				{
					id: "client-work",
					label: "Client work",
					Icon: n$4
				}
			]
		}]
	},
	{
		key: "workplace",
		title: "Where does your work happen?",
		subtitle: "This helps us tailor sharing and collaboration",
		groups: [{
			key: "workplace",
			multi: false,
			options: [
				{
					id: "company",
					label: "A company",
					Icon: m$9
				},
				{
					id: "startup",
					label: "A startup",
					Icon: n$6
				},
				{
					id: "agency",
					label: "A design agency",
					Icon: c$6
				},
				{
					id: "freelance",
					label: "I freelance",
					Icon: n$5
				},
				{
					id: "just-me",
					label: "Just me, for fun",
					Icon: s$6
				}
			]
		}, {
			key: "team",
			multi: false,
			layout: "inline",
			dividerLabel: "Will others join you?",
			options: [{
				id: "solo",
				label: "Solo",
				Icon: n$5
			}, {
				id: "with-team",
				label: "With my team",
				Icon: n$4
			}]
		}]
	},
	{
		key: "tools",
		title: "What do you design with today?",
		subtitle: "Select all that apply",
		groups: [{
			key: "tools",
			multi: true,
			layout: "grid",
			options: [
				{
					id: "figma",
					label: "Figma",
					Icon: FigmaLogo
				},
				{
					id: "just-code",
					label: "Just code",
					Icon: n$17
				},
				{
					id: "claude-design",
					label: "Claude Design",
					Icon: ClaudeLogo
				},
				{
					id: "cursor",
					label: "Cursor",
					Icon: CursorLogo
				},
				{
					id: "claude-code",
					label: "Claude Code",
					Icon: ClaudeLogo
				},
				{
					id: "codex",
					label: "Codex",
					Icon: CodexLogo
				}
			],
			other: {
				option: {
					id: "other",
					label: "Another design tool",
					Icon: n$15
				},
				inputKey: "tools-other",
				placeholder: "Which one? e.g. Paper, Framer,…"
			}
		}]
	},
	{
		key: "source",
		title: "How did you find us?",
		subtitle: "Last question, promise. It really helps us.",
		groups: [{
			key: "source",
			multi: true,
			options: [
				{
					id: "x",
					label: "X (Twitter)",
					Icon: n$2
				},
				{
					id: "linkedin",
					label: "LinkedIn",
					Icon: c$11
				},
				{
					id: "google",
					label: "Google",
					Icon: f$3
				},
				{
					id: "friend",
					label: "A friend",
					Icon: n$4
				}
			],
			other: {
				option: {
					id: "other",
					label: "Somewhere else",
					Icon: n$15
				},
				inputKey: "source-other",
				placeholder: "Tell us where please"
			}
		}]
	},
	{
		kind: "follow",
		key: "follow",
		title: "Get tips, updates, inspo",
		subtitle: "Follow us on X where we post tips, product updates, and inspiration",
		handle: "petalHQ",
		usernameKey: "x-username"
	}
];

export { ONBOARDING_STEPS };
