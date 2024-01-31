import dayjs from "dayjs";
import { Message } from "pages/Home";

export default function makeSections(chatList: Message[]) {
  const sections: { [key: string]: Message[] } = {};
  chatList.forEach((chat: Message) => {
    const monthDate = dayjs(chat.createdAt).format("YYYY-MM-DD");
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });

  return sections;
}
