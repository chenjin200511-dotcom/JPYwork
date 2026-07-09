// Purpose: Closes the public homepage with localized reserved-workspace context.
import type { Dictionary } from "@/lib/i18n/dictionary";

type FooterProps = {
  copy: Dictionary;
};

export function Footer({ copy }: FooterProps) {
  return (
    <footer className="public-footer">
      <span>{copy.publicSections.footer.title}</span>
      <p>{copy.publicSections.footer.note}</p>
    </footer>
  );
}
