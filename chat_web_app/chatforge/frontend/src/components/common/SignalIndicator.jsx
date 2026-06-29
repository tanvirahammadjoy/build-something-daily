export default function SignalIndicator({ online }) {
  return (
    <span className={`signal-indicator ${online ? 'online' : 'offline'}`} title={online ? 'Online' : 'Offline'}>
      <span className="bar bar-1" />
      <span className="bar bar-2" />
      <span className="bar bar-3" />
    </span>
  );
}
