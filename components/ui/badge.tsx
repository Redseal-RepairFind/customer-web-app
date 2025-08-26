import Text from "./text";

const Badge = ({
  count,
  isActive,
}: {
  count: number | string;
  isActive: boolean;
}) => {
  if (!isActive) return null;
  return (
    <span className="h-4 min-w-4 rounded-full bg-red-300 text-light-main flex items-center justify-center ">
      <Text.SmallText className="text-[10px]">{count}</Text.SmallText>
    </span>
  );
};

export default Badge;
