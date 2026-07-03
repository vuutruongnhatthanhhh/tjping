import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import RemindersClient, { type ReminderItem } from "./RemindersClient";

export const dynamic = "force-dynamic";

interface ReminderRow {
  id: string;
  title: string;
  content: string;
  remind_at: string;
  repeat_type: string;
  status: string;
  channels: string[];
}

interface ReminderStepRow {
  reminder_id: string;
  step_type: string;
}

export default async function RemindersPage() {
  if (!isSupabaseConfigured()) {
    return <RemindersClient reminders={[]} isDemo />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: remindersData } = await supabase
    .from("reminders")
    .select("id,title,content,remind_at,repeat_type,status,channels")
    .eq("user_id", user.id)
    .order("remind_at", { ascending: false })
    .limit(12)
    .returns<ReminderRow[]>();

  const reminderIds = (remindersData || []).map((item) => item.id);

  const { data: reminderStepsData } =
    reminderIds.length > 0
      ? await supabase
          .from("reminder_steps")
          .select("reminder_id,step_type")
          .in("reminder_id", reminderIds)
          .returns<ReminderStepRow[]>()
      : { data: [] as ReminderStepRow[] };

  const stepTypesByReminderId = (reminderStepsData || []).reduce<
    Record<string, string[]>
  >((accumulator, item) => {
    if (!accumulator[item.reminder_id]) {
      accumulator[item.reminder_id] = [];
    }

    accumulator[item.reminder_id].push(item.step_type);
    return accumulator;
  }, {});

  const reminders: ReminderItem[] = (remindersData || []).map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    remindAt: item.remind_at,
    repeatType: item.repeat_type,
    status: item.status,
    channels: item.channels.map(mapChannel),
    stepTypes: stepTypesByReminderId[item.id] || ["on_time"],
  }));

  return (
    <RemindersClient
      userEmail={user.email || undefined}
      userName={
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : undefined
      }
      reminders={reminders}
    />
  );
}

function mapChannel(value: string) {
  if (value === "email") return "Email";
  if (value === "telegram") return "Telegram";
  return value;
}
