import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // import UTC plugin
dayjs.extend(utc);

export default function makeSections(chatList: any[]) {
  const sections: { [key: string]: any[] } = {};
  chatList.forEach((chat) => {
    const timestampWithSixHoursAdded = dayjs
      .utc(chat.updatedAt)
      .add(6, "hour")
      .format();
    const monthDate = dayjs(timestampWithSixHoursAdded).format("YYYY-MM-DD");
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });

  return sections;
}
