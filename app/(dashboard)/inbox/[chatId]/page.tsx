import SingleChatItem from "@/components/dashboard/inbox/single-chat";

const SingleChat = async ({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) => {
  const { chatId } = await params;

  return <SingleChatItem id={chatId} />;
};

export default SingleChat;
