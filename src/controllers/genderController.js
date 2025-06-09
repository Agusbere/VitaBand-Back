import supabase from "../supabaseClient.js";

export const getGenders = async (req, res) => {
    const { data, error } = await supabase.from("gender").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

export const getGenderById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from("gender").select("*").eq("id", id).single();
    if (error) return res.status(404).json({ error: "Género no encontrado" });
    res.json(data);
};

export const createGender = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Falta el campo 'name'" });

    const { data, error } = await supabase.from("gender").insert([{ name }]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};

export const updateGender = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const { data, error } = await supabase.from("gender").update({ name }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

export const deleteGender = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("gender").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
};
