"use client";

import {
  Button,
  FieldError,
  Form,
  Label,
  Radio,
  RadioGroup,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { useActionState } from "react";

import { type RatingState, submitRatingAction } from "@/app/messages/actions";

type RatingFormProps = {
  conversationId: string;
  itemId: string;
  pickupId: string;
  rateeDisplayName: string;
};

const initialState: RatingState = { error: null };

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export function RatingForm({
  conversationId,
  itemId,
  pickupId,
  rateeDisplayName,
}: RatingFormProps) {
  const [state, formAction, isPending] = useActionState(submitRatingAction, initialState);

  return (
    <Form action={formAction} className="border-border flex flex-col gap-3 border-t pt-4">
      <input name="pickupId" type="hidden" value={pickupId} />
      <input name="conversationId" type="hidden" value={conversationId} />
      <input name="itemId" type="hidden" value={itemId} />

      <p className="text-sm">How did the pickup with {rateeDisplayName} go?</p>

      <RadioGroup isDisabled={isPending} isRequired name="stars" orientation="horizontal">
        <Label>Rating</Label>
        {STAR_VALUES.map((value) => (
          <Radio key={value} value={String(value)}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {value} {value === 1 ? "star" : "stars"}
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>

      <TextField isDisabled={isPending} name="comment">
        <Label>Comment (optional)</Label>
        <TextArea aria-label="Rating comment" placeholder="Anything worth noting?" />
        <FieldError />
      </TextField>

      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}

      <Button className="self-start" isPending={isPending} type="submit">
        {({ isPending: pending }) => (
          <>
            {pending ? <Spinner color="current" size="sm" /> : null}
            Submit rating
          </>
        )}
      </Button>
    </Form>
  );
}
