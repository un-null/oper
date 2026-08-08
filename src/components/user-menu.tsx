"use client";

import { Dropdown, Header, Label, Separator } from "@heroui/react";
import { IconMessageCircle, IconPackage, IconSettings } from "@tabler/icons-react";
import Avatar from "boring-avatars";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

type UserMenuProps = {
  userId: string;
  displayName: string;
};

const AVATAR_COLORS = ["#3f7a4f", "#e6f0e3", "#d9764a", "#fbe8de", "#16201a"];

export function UserMenu({ displayName, userId }: UserMenuProps) {
  const router = useRouter();

  async function handleAction(key: React.Key) {
    if (key === "sign-out") {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Dropdown>
      <button aria-label={`Account menu for ${displayName}`} className="block" type="button">
        <Avatar colors={AVATAR_COLORS} name={userId} size={36} variant="beam" />
      </button>
      <Dropdown.Popover className="min-w-50">
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Section>
            <Header>Application</Header>
            <Dropdown.Item href="/items" id="my-items" textValue="My items">
              <IconPackage className="text-muted size-4 shrink-0" />
              <Label>My items</Label>
            </Dropdown.Item>
            <Dropdown.Item href="/messages" id="messages" textValue="Messages">
              <IconMessageCircle className="text-muted size-4 shrink-0" />
              <Label>Messages</Label>
            </Dropdown.Item>
            <Dropdown.Item href="/settings" id="settings" textValue="Settings">
              <IconSettings className="text-muted size-4 shrink-0" />
              <Label>Settings</Label>
            </Dropdown.Item>
          </Dropdown.Section>
          <Separator />
          <Dropdown.Item id="sign-out" textValue="Sign out" variant="danger">
            <Label>Sign out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
