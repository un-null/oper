"use client";

import {
  Button,
  DateField,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
  TimeField,
} from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useActionState } from "react";

import {
  cancelPickupAction,
  completePickupAction,
  confirmPickupAction,
  type PickupState,
  proposePickupAction,
} from "@/app/messages/actions";
import type { ActivePickup } from "@/db/dal";

type PickupPanelProps = {
  conversationId: string;
  itemId: string;
  partnerDisplayName: string;
  pickupSpotDefault: string;
  pickup: ActivePickup | undefined;
  viewerId: string;
};

const initialState: PickupState = { error: null };

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function PickupPanel({
  conversationId,
  itemId,
  partnerDisplayName,
  pickupSpotDefault,
  pickup,
  viewerId,
}: PickupPanelProps) {
  if (!pickup) {
    return (
      <ProposeForm
        conversationId={conversationId}
        itemId={itemId}
        pickupSpotDefault={pickupSpotDefault}
      />
    );
  }

  const isOwnProposal = pickup.proposedBy === viewerId;

  if (pickup.status === "proposed" && isOwnProposal) {
    return (
      <div className="border-border flex items-center gap-3 border-t pt-4">
        <span className="text-sm">
          Waiting for {partnerDisplayName} to confirm — {dateTimeFormatter.format(pickup.time)} at{" "}
          {pickup.spot}
        </span>
        <div className="ml-auto">
          <CancelButton conversationId={conversationId} itemId={itemId} pickupId={pickup.id} />
        </div>
      </div>
    );
  }

  if (pickup.status === "proposed") {
    return (
      <div className="border-border flex items-center gap-3 border-t pt-4">
        <span className="text-sm">
          {partnerDisplayName} proposed {dateTimeFormatter.format(pickup.time)} at {pickup.spot}
        </span>
        <div className="ml-auto flex gap-2">
          <ConfirmButton conversationId={conversationId} itemId={itemId} pickupId={pickup.id} />
          <CancelButton
            conversationId={conversationId}
            itemId={itemId}
            label="Decline"
            pickupId={pickup.id}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border-border flex items-center gap-3 border-t pt-4">
      <span className="text-sm">
        Confirmed for {dateTimeFormatter.format(pickup.time)} at {pickup.spot}
      </span>
      <div className="ml-auto flex gap-2">
        <CompleteButton conversationId={conversationId} itemId={itemId} pickupId={pickup.id} />
        <CancelButton conversationId={conversationId} itemId={itemId} pickupId={pickup.id} />
      </div>
    </div>
  );
}

function ProposeForm({
  conversationId,
  itemId,
  pickupSpotDefault,
}: {
  conversationId: string;
  itemId: string;
  pickupSpotDefault: string;
}) {
  const [state, formAction, isPending] = useActionState(proposePickupAction, initialState);

  return (
    <Form action={formAction} className="border-border flex flex-col gap-3 border-t pt-4">
      <input name="conversationId" type="hidden" value={conversationId} />
      <input name="itemId" type="hidden" value={itemId} />
      <div className="flex flex-wrap items-end gap-3">
        <DateField
          isDisabled={isPending}
          isRequired
          minValue={today(getLocalTimeZone())}
          name="date"
        >
          <Label>Pickup date</Label>
          <DateField.Group aria-label="Pickup date">
            <DateField.Input>
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
          <FieldError />
        </DateField>

        <TimeField
          granularity="minute"
          hourCycle={24}
          isDisabled={isPending}
          isRequired
          name="time"
        >
          <Label>Pickup time</Label>
          <TimeField.Group aria-label="Pickup time">
            <TimeField.Input>
              {(segment) => <TimeField.Segment segment={segment} />}
            </TimeField.Input>
          </TimeField.Group>
          <FieldError />
        </TimeField>

        <TextField
          className="flex-1"
          defaultValue={pickupSpotDefault}
          isDisabled={isPending}
          isRequired
          name="spot"
        >
          <Label>Pickup spot</Label>
          <Input aria-label="Pickup spot" />
          <FieldError />
        </TextField>
      </div>

      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}

      <Button className="self-start" isPending={isPending} type="submit">
        {({ isPending: pending }) => (
          <>
            {pending ? <Spinner color="current" size="sm" /> : null}
            Propose pickup
          </>
        )}
      </Button>
    </Form>
  );
}

function ConfirmButton({
  conversationId,
  itemId,
  pickupId,
}: {
  conversationId: string;
  itemId: string;
  pickupId: string;
}) {
  const [state, formAction, isPending] = useActionState(confirmPickupAction, initialState);

  return (
    <Form action={formAction} className="contents">
      <input name="pickupId" type="hidden" value={pickupId} />
      <input name="conversationId" type="hidden" value={conversationId} />
      <input name="itemId" type="hidden" value={itemId} />
      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
      <Button isPending={isPending} type="submit">
        Confirm
      </Button>
    </Form>
  );
}

function CompleteButton({
  conversationId,
  itemId,
  pickupId,
}: {
  conversationId: string;
  itemId: string;
  pickupId: string;
}) {
  const [state, formAction, isPending] = useActionState(completePickupAction, initialState);

  return (
    <Form action={formAction} className="contents">
      <input name="pickupId" type="hidden" value={pickupId} />
      <input name="conversationId" type="hidden" value={conversationId} />
      <input name="itemId" type="hidden" value={itemId} />
      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
      <Button isPending={isPending} type="submit">
        Mark as picked up
      </Button>
    </Form>
  );
}

function CancelButton({
  conversationId,
  itemId,
  pickupId,
  label = "Cancel",
}: {
  conversationId: string;
  itemId: string;
  pickupId: string;
  label?: string;
}) {
  const [state, formAction, isPending] = useActionState(cancelPickupAction, initialState);

  return (
    <Form action={formAction} className="contents">
      <input name="pickupId" type="hidden" value={pickupId} />
      <input name="conversationId" type="hidden" value={conversationId} />
      <input name="itemId" type="hidden" value={itemId} />
      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
      <Button isPending={isPending} type="submit" variant="outline">
        {label}
      </Button>
    </Form>
  );
}
