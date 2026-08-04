"use client";

import {
  Button,
  Calendar,
  Chip,
  DateField,
  DatePicker,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
  TimeField,
} from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { IconCalendar, IconMapPin } from "@tabler/icons-react";
import { useActionState } from "react";

import {
  cancelPickupAction,
  completePickupAction,
  confirmPickupAction,
  type PickupState,
  proposePickupAction,
} from "@/app/messages/actions";
import { RatingForm } from "@/components/rating-form";
import type { ActivePickup, RatablePickup } from "@/db/dal";

type PickupPanelProps = {
  conversationId: string;
  itemId: string;
  partnerDisplayName: string;
  pickupSpotDefault: string;
  pickup: ActivePickup | undefined;
  ratable: RatablePickup | undefined;
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
  ratable,
  viewerId,
}: PickupPanelProps) {
  return (
    <>
      {ratable ? (
        <RatingForm
          conversationId={conversationId}
          itemId={itemId}
          pickupId={ratable.pickupId}
          rateeDisplayName={ratable.rateeDisplayName}
        />
      ) : null}
      <PickupStatus
        conversationId={conversationId}
        itemId={itemId}
        partnerDisplayName={partnerDisplayName}
        pickup={pickup}
        pickupSpotDefault={pickupSpotDefault}
        viewerId={viewerId}
      />
    </>
  );
}

function PickupCard({ status, children }: { status?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-border bg-surface rounded-stub flex flex-col gap-3 border p-4">
      <div className="flex items-center gap-2">
        <IconCalendar className="text-muted h-4 w-4" />
        <span className="font-display text-muted text-xs font-semibold tracking-[0.18em] uppercase">
          Pickup
        </span>
        {status ? <div className="ml-auto">{status}</div> : null}
      </div>
      {children}
    </div>
  );
}

function PickupStatus({
  conversationId,
  itemId,
  partnerDisplayName,
  pickup,
  pickupSpotDefault,
  viewerId,
}: Omit<PickupPanelProps, "ratable">) {
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
      <PickupCard
        status={
          <Chip color="warning" size="sm">
            Pending
          </Chip>
        }
      >
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{dateTimeFormatter.format(pickup.time)}</span>
          <span className="text-muted flex items-center gap-1.5">
            <IconMapPin className="h-3.5 w-3.5" />
            {pickup.spot}
          </span>
          <span className="text-muted">Waiting for {partnerDisplayName} to confirm</span>
        </div>
        <div className="flex gap-2">
          <CancelButton conversationId={conversationId} itemId={itemId} pickupId={pickup.id} />
        </div>
      </PickupCard>
    );
  }

  if (pickup.status === "proposed") {
    return (
      <PickupCard
        status={
          <Chip color="warning" size="sm">
            Pending
          </Chip>
        }
      >
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{dateTimeFormatter.format(pickup.time)}</span>
          <span className="text-muted flex items-center gap-1.5">
            <IconMapPin className="h-3.5 w-3.5" />
            {pickup.spot}
          </span>
          <span className="text-muted">{partnerDisplayName} proposed this pickup</span>
        </div>
        <div className="flex gap-2">
          <ConfirmButton conversationId={conversationId} itemId={itemId} pickupId={pickup.id} />
          <CancelButton
            conversationId={conversationId}
            itemId={itemId}
            label="Decline"
            pickupId={pickup.id}
          />
        </div>
      </PickupCard>
    );
  }

  return (
    <PickupCard
      status={
        <Chip color="success" size="sm">
          Confirmed
        </Chip>
      }
    >
      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{dateTimeFormatter.format(pickup.time)}</span>
        <span className="text-muted flex items-center gap-1.5">
          <IconMapPin className="h-3.5 w-3.5" />
          {pickup.spot}
        </span>
      </div>
      <div className="flex gap-2">
        <CompleteButton conversationId={conversationId} itemId={itemId} pickupId={pickup.id} />
        <CancelButton conversationId={conversationId} itemId={itemId} pickupId={pickup.id} />
      </div>
    </PickupCard>
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
    <PickupCard>
      <Form action={formAction} className="flex flex-col gap-3">
        <input name="conversationId" type="hidden" value={conversationId} />
        <input name="itemId" type="hidden" value={itemId} />
        <div className="flex flex-wrap items-end gap-3">
          <DatePicker
            isDisabled={isPending}
            isRequired
            minValue={today(getLocalTimeZone())}
            name="date"
          >
            <Label>Pickup date</Label>
            <DateField.Group>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DatePicker.Trigger>
                  <DatePicker.TriggerIndicator />
                </DatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <FieldError />
            <DatePicker.Popover>
              <Calendar aria-label="Pickup date">
                <Calendar.Header>
                  <Calendar.Heading />
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>

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
    </PickupCard>
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
