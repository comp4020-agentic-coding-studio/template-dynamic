// The routes the invariants run against. A server-rendered app's pages can't
// be discovered by walking dist/ (there are no .html files), so this list is
// part of the stack-swap contract: when you add a page, add its route here,
// or the invariants silently stop covering it.
export const ROUTES = ["/"];
