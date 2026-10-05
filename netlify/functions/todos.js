import { getStore } from "@netlify/blobs";

export const config = { path: "/api/todos" };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  try {
    const store = getStore("todos");
    const list = (await store.get("list", { type: "json" })) || [];
    const save = (l) => store.setJSON("list", l);
    const body = ["POST", "PATCH", "DELETE"].includes(req.method) ? await req.json() : {};

    if (req.method === "GET") return json(list);

    if (req.method === "POST") {
      const title = (body.title || "").trim();
      if (!title) return json({ error: "Title is required" }, 400);
      const todo = { id: Date.now(), title, done: false };
      await save([todo, ...list]);
      return json(todo, 201);
    }

    if (req.method === "PATCH") {
      await save(list.map((t) => (t.id === body.id ? { ...t, done: !!body.done } : t)));
      return json({ ok: true });
    }

    if (req.method === "DELETE") {
      await save(list.filter((t) => t.id !== body.id));
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
};
