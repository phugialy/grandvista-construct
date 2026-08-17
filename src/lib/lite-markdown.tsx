type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

/** Parses the "##/### heading, -/* list, **bold**" convention used across posting and article copy. */
function parseBlocks(value: string): Block[] {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length > 0) blocks.push({ type: "list", items: listItems });
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text: heading[2].replace(/\*\*/g, "").trim(),
      });
      continue;
    }

    const listItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      listItems.push(listItem[1].trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong className="font-black text-ink" key={`${part}-${index}`}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export function LiteMarkdown({ className, value }: { className?: string; value: string }) {
  const blocks = parseBlocks(value);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return (
            <Tag className="mt-7 text-2xl font-black leading-tight text-ink first:mt-0" key={index}>
              {renderInline(block.text)}
            </Tag>
          );
        }

        if (block.type === "list") {
          return (
            <ul className="mt-5 grid gap-2" key={index}>
              {block.items.map((item, itemIndex) => (
                <li className="flex gap-3" key={itemIndex}>
                  <span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p className="mt-5 first:mt-0" key={index}>
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
