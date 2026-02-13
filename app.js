const supabase = window.supabase.createClient(
  "https://gcodvildgtyglhgslqnz.supabase.co",
  "sb_publishable_TAAcWZTVtQMrFXGIDPB3qw_0EeDl4M-"
);


let currentUser = "";

// Hash password SHA-256
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function register() {
  const username = document.getElementById("username").value;
  const password = await hashPassword(
    document.getElementById("password").value
  );

  const { error } = await supabase
    .from("users")
    .insert([{ username, password }]);

  if (error) return alert("Username sudah dipakai!");
  alert("Register berhasil!");
}

async function login() {
  const username = document.getElementById("username").value;
  const password = await hashPassword(
    document.getElementById("password").value
  );

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password);

  if (data.length === 0) return alert("Login gagal!");

  currentUser = username;
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");

  subscribeRealtime();
  loadMessages();
}

async function sendMessage() {
  const text = document.getElementById("messageInput").value;
  const receiver = document.getElementById("toUser").value;

  await supabase.from("messages").insert([
    { sender: currentUser, receiver, text }
  ]);

  document.getElementById("messageInput").value = "";
}

async function loadMessages() {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  renderMessages(data);
}

function renderMessages(data) {
  const box = document.getElementById("messages");
  box.innerHTML = "";

  data.forEach(msg => {
    if (
      (msg.sender === currentUser &&
        msg.receiver === document.getElementById("toUser").value) ||
      (msg.receiver === currentUser &&
        msg.sender === document.getElementById("toUser").value)
    ) {
      box.innerHTML += `<p><b>${msg.sender}:</b> ${msg.text}</p>`;
    }
  });

  box.scrollTop = box.scrollHeight;
}

function subscribeRealtime() {
  supabase
    .channel("messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      payload => {
        loadMessages();
      }
    )
    .subscribe();
}
