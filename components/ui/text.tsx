import * as React from "react";

type BaseProps<E extends HTMLElement = HTMLElement> =
  React.HTMLAttributes<E> & { className?: string };

type TextCompound = React.FC<React.HTMLAttributes<HTMLDivElement>> & {
  Heading: React.FC<BaseProps<HTMLHeadingElement>>;
  SubHeading: React.FC<BaseProps<HTMLHeadingElement>>;
  SmallHeading: React.FC<BaseProps<HTMLHeadingElement>>;
  Paragraph: React.FC<BaseProps<HTMLParagraphElement>>;
  SubParagraph: React.FC<BaseProps<HTMLParagraphElement>>;
  SmallText: React.FC<BaseProps<HTMLSpanElement>>;
  LinkText: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
};

function TextBase({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
TextBase.displayName = "Text";

function TextHeading({
  children,
  className,
  ...props
}: BaseProps<HTMLHeadingElement>) {
  return (
    <h1
      className={`text-2xl   md:text-3xl font-bold ${className || ""}`}
      {...props}
    >
      {children}
    </h1>
  );
}
TextHeading.displayName = "Text.Heading";

function TextSubHeading(props: BaseProps<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-2xl font-semibold ${props.className || ""}`}
      {...props}
    />
  );
}
TextSubHeading.displayName = "Text.SubHeading";

function TextSmallHeading(props: BaseProps<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-xl font-semibold ${props.className || ""}`}
      {...props}
    />
  );
}
TextSmallHeading.displayName = "Text.SmallHeading";

function TextParagraph(props: BaseProps<HTMLParagraphElement>) {
  return (
    <p
      className={`text-base leading-relaxed ${props.className || ""}`}
      {...props}
    />
  );
}
TextParagraph.displayName = "Text.Paragraph";

function TextSubParagraph(props: BaseProps<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm leading-relaxed ${props.className || ""}`}
      {...props}
    />
  );
}
TextSubParagraph.displayName = "Text.SubParagraph";

function TextSmallText(props: BaseProps<HTMLSpanElement>) {
  return <p className={`text-xs ${props.className || ""}`} {...props} />;
}
TextSmallText.displayName = "Text.SmallText";

function TextLinkText(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { className, ...rest } = props;
  return (
    <a
      className={`underline-offset-4 hover:underline ${className || ""}`}
      {...rest}
    />
  );
}
TextLinkText.displayName = "Text.LinkText";

const Text = Object.assign(TextBase, {
  Heading: TextHeading,
  SubHeading: TextSubHeading,
  SmallHeading: TextSmallHeading,
  Paragraph: TextParagraph,
  SubParagraph: TextSubParagraph,
  SmallText: TextSmallText,
  LinkText: TextLinkText,
}) as TextCompound;

export default Text;
