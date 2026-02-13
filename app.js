const { createClient } = window.supabase;

const supabaseClient = createClient(
  "https://gcodvildgtyglhgslqnz.supabase.co",
  "sb_publishable_TAAcWZTVtQMrFXGIDPB3qw_0EeDl4M-"
);

let currentUser = "";

// ================= REGISTER =================
async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient
    .from("users")
    .insert([{ username, password }]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Register berhasil!");
}

// ================= LOGIN =================
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password);

  if (error) {
    alert(error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("Login gagal!");
    return;
  }

  currentUser = username;

  document.getElementById("auth").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");

  alert("Login berhasil!");
}
