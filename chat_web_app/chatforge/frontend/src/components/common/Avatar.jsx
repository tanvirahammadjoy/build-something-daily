// Deterministically picks a background color for a user's initials avatar,
// so the same username always renders the same color everywhere in the app.
const PALETTE = ['#E8A33D', '#4FB6A8', '#7C8CE8', '#D9777B', '#6FBF73', '#C98ED1'];

function colorForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ username = '?', size = 40 }) {
  const initial = username.charAt(0).toUpperCase();
  const bg = colorForName(username);

  return (
    <div className="avatar" style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.42 }}>
      {initial}
    </div>
  );
}
