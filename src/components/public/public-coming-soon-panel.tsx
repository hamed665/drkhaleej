type PublicComingSoonPanelProps = {
  heading: string;
  body: string;
};

export function PublicComingSoonPanel({ heading, body }: PublicComingSoonPanelProps) {
  return (
    <section className="public-coming-soon" aria-label={heading}>
      <h2 className="public-coming-soon__heading">{heading}</h2>
      <p className="public-coming-soon__body">{body}</p>
    </section>
  );
}
