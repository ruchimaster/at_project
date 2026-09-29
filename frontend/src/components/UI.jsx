export function PageTitle({ title, subtitle }) {
  return (
    <div className="page-title">
      <h1>{title}</h1>

      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export function Empty({ text }) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;

  return (
    <div className="error-box">
      {message}
    </div>
  );
}

export function SuccessBox({ message }) {
  if (!message) return null;

  return (
    <div className="success-box">
      {message}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="empty">
      Loading...
    </div>
  );
}