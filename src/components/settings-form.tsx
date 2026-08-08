"use client";

import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { useActionState } from "react";

import { type SettingsState, updateSettings } from "@/app/settings/actions";

const initialState: SettingsState = { error: null };

type SettingsFormProps = {
  displayName: string;
};

export function SettingsForm({ displayName }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateSettings, initialState);

  return (
    <Form action={formAction} className="flex flex-col gap-4">
      <TextField
        defaultValue={displayName}
        isDisabled={isPending}
        isRequired
        maxLength={50}
        name="displayName"
      >
        <Label>Display name</Label>
        <Input placeholder="How neighbors will see you" />
        <Description>This is the name neighbors will see on your items and profile.</Description>
        <FieldError />
      </TextField>
      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
      <Button isPending={isPending} type="submit">
        {({ isPending: pending }) => (
          <>
            {pending ? <Spinner color="current" size="sm" /> : null}
            {pending ? "Saving…" : "Save"}
          </>
        )}
      </Button>
    </Form>
  );
}
