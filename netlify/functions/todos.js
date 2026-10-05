const { createClient } = require("@supabase/supabase-js");

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    if (event.httpMethod === "GET") {
      const { data, error } = await db.from("todos").select("*").order("id", { ascending: false });
      if (error) throw error;
      return json(200, data);
    }
    if (event.httpMethod === "POST") {
      const title = (body.title || "").trim();
      if (!title) return json(400, { error: "Title is required" });
      const { data, error } = await db.from("todos").insert({ title }).select().single();
      if (error) throw error;
      return json(201, data);
    }
    if (event.httpMethod === "PATCH") {
      const { data, error } = await db.from("todos").update({ done: !!body.done }).eq("id", body.id).select().single();
      if (error) throw error;
      return json(200, data);
    }
    if (event.httpMethod === "DELETE") {
      const { error } = await db.from("todos").delete().eq("id", body.id);
      if (error) throw error;
      return json(200, { ok: true });
    }
    return json(405, { error: "Method not allowed" });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
