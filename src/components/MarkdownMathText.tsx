import useFontFamily from "@/src/hooks/useFontFamily";
import React from "react";
import { type StyleProp, Text, type ViewStyle } from "react-native";
import {
  EnrichedMarkdownText,
  type MarkdownStyle,
} from "react-native-enriched-markdown";

// Error boundary to catch render errors from EnrichedMarkdownText
class MarkdownErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode; resetKey: string },
  { hasError: boolean }
> {
  constructor(props: {
    fallback: React.ReactNode;
    children: React.ReactNode;
    resetKey: string;
  }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface MarkdownMathTextProps {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** "github" (default) supports block $$...$$ math; "commonmark" for plain text bubbles */
  flavor?: "github" | "commonmark";
  /** Whether the text is selectable (long-press copy). Default true. Set false inside Pressable buttons. */
  selectable?: boolean;
  /** When true, inline $...$ math that follows a colon is promoted to display $$...$$ math. */
  colonDisplayMath?: boolean;
  /** When true, ALL inline $...$ math is promoted to display $$...$$ math. */
  allDisplayMath?: boolean;
}

/**
 * Converts ALL single-dollar inline math ($...$) that appears after the first ":"
 * in the text into double-dollar display math on its own line.
 * Content before the first ":" is left unchanged (inline math stays inline).
 * e.g. "$a=3$. Apply: $x=1$. $x=2$." → "$a=3$. Apply:\n\n$$x=1$$\n\n\n\n$$x=2$$\n\n"
 */
function convertInlineMathAfterColon(text: string): string {
  const colonIdx = text.indexOf(":");
  if (colonIdx === -1) return text;

  const before = text.slice(0, colonIdx + 1);
  const after = text.slice(colonIdx + 1);

  // Protect existing $$...$$ in the after-colon section
  const blocks: string[] = [];
  const withPlaceholders = after.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    blocks.push(match);
    return `\x00MATH${blocks.length - 1}\x00`;
  });
  // Convert all remaining $...$ to block $$...$$ on their own line, consuming trailing period or comma
  const converted = withPlaceholders.replace(
    /\$([^$\n]+)\$(\s*[.,])?/g,
    "\n\n$$$$$1$$$$\n\n",
  );
  const restored = converted.replace(
    /\x00MATH(\d+)\x00/g,
    (_, i) => blocks[parseInt(i, 10)],
  );

  return before + restored;
}

/**
 * Converts ALL single-dollar inline math ($...$) to double-dollar display math,
 * each on its own line. Existing $$...$$ blocks are protected and left unchanged.
 */
function convertAllInlineMathToDisplay(text: string): string {
  // 1. Temporarily protect existing $$...$$ so we don't double-convert them
  const blocks: string[] = [];
  const withPlaceholders = text.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    blocks.push(match);
    return `\x00MATH${blocks.length - 1}\x00`;
  });
  // 2. Convert remaining lone $...$ to block $$...$$ on its own line,
  //    consuming any immediately trailing period or comma so it doesn't float alone.
  //    Single-pass replacement avoids re-matching $..$ inside newly created $$..$$
  const converted = withPlaceholders.replace(
    /\$([^$\n]+)\$(\s*[.,])?/g,
    "\n\n$$$$$1$$$$\n\n",
  );
  // 3. Restore protected $$...$$ blocks
  return converted.replace(
    /\x00MATH(\d+)\x00/g,
    (_, i) => blocks[parseInt(i, 10)],
  );
}

/** Strips all \boxed{...} wrappers, keeping their interior content.
 *  Handles arbitrarily nested braces, e.g. \boxed{\frac{a}{b}}. */
function stripBoxed(text: string): string {
  const tag = "\\boxed";
  let result = "";
  let i = 0;
  while (i < text.length) {
    const idx = text.indexOf(tag, i);
    if (idx === -1) {
      result += text.slice(i);
      break;
    }
    result += text.slice(i, idx);
    // skip optional whitespace and opening brace
    let j = idx + tag.length;
    while (j < text.length && text[j] === " ") j++;
    if (text[j] !== "{") {
      // no opening brace — keep as-is
      result += tag;
      i = idx + tag.length;
      continue;
    }
    j++; // skip '{'
    let depth = 1;
    const start = j;
    while (j < text.length && depth > 0) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}") depth--;
      if (depth > 0) j++;
      else j++; // skip closing '}'
    }
    // everything between the outer braces is kept
    result += text.slice(start, j - 1);
    i = j;
  }
  return result;
}

export function MarkdownMathText({
  content,
  fontFamily,
  fontSize,
  color,
  containerStyle,
  flavor = "github",
  selectable = true,
  colonDisplayMath = false,
  allDisplayMath = false,
}: MarkdownMathTextProps) {
  const mapFont = useFontFamily();
  const resolvedFont = mapFont(fontFamily);

  // Strip \boxed{...} — keep only the interior, handling nested braces.
  // Optionally promote inline math to display math based on props.
  const stripped = stripBoxed(content);
  const processedContent = allDisplayMath
    ? convertAllInlineMathToDisplay(stripped)
    : colonDisplayMath
      ? convertInlineMathAfterColon(stripped)
      : stripped;

  // Enlarge display math font when the content contains fractions (\frac)
  const hasFraction = processedContent.includes("\\frac");
  const mathFontSize = hasFraction
    ? Math.round(fontSize * 1.05)
    : Math.round(fontSize * 1);

  const markdownStyle: MarkdownStyle = {
    paragraph: {
      fontFamily: resolvedFont,
      fontSize,
      color,
      lineHeight: Math.round(fontSize * 1.65),
      marginTop: 0,
      marginBottom: 0,
    },
    strong: {
      fontFamily:
        resolvedFont === "Huninn_400Regular" ? resolvedFont : "Fredoka_700Bold",
      fontWeight: resolvedFont === "Huninn_400Regular" ? "bold" : "normal",
      color,
    },
    inlineMath: { color },
    math: {
      fontSize: mathFontSize,
      color,
      backgroundColor: "transparent",
      marginTop: 2,
      marginBottom: 2,
    },
  };

  const fallbackText = (
    <Text
      style={{
        fontFamily: resolvedFont,
        fontSize,
        color,
        lineHeight: Math.round(fontSize * 1.45),
      }}
    >
      {content}
    </Text>
  );

  return (
    <MarkdownErrorBoundary fallback={fallbackText} resetKey={content}>
      <EnrichedMarkdownText
        markdown={processedContent}
        containerStyle={(containerStyle ?? undefined) as ViewStyle | undefined}
        markdownStyle={markdownStyle}
        md4cFlags={{ latexMath: true }}
        flavor={flavor}
        selectable={selectable}
      />
    </MarkdownErrorBoundary>
  );
}
