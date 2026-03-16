import { useTopicDetail } from "@/hooks";
import { useAuthStore } from "@/stores";
import { useParams } from "react-router-dom";
import { TopicEditorForm } from "./TopicEditorForm";

export default function CreateTopic() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { data: topic, isLoading: topicLoading } = useTopicDetail(id);

  if (id && topicLoading) return null;

  if (!id || !user?.id) return null;

  return <TopicEditorForm key={`${id}-create`} id={id} mode="create" topic={topic ?? null} userId={user.id} />;
}
