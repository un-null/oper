"use client";

import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  Select,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { useActionState } from "react";

import { type PostItemState, postItem } from "@/app/items/new/actions";
import { itemCategoryEnum, itemConditionEnum } from "@/db/schema";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/item-labels";
import { PICKUP_SPOTS } from "@/lib/pickup-spots";

const initialState: PostItemState = { error: null };

export function PostItemForm() {
  const [state, formAction, isPending] = useActionState(postItem, initialState);

  return (
    <Form action={formAction} className="flex flex-col gap-6">
      <TextField isDisabled={isPending} isRequired maxLength={80} name="title">
        <Label>Title</Label>
        <Input placeholder="e.g. 2-seater sofa, light wear" />
        <FieldError />
      </TextField>

      <TextField isDisabled={isPending} maxLength={1000} name="description">
        <Label>Description</Label>
        <TextArea
          className="h-28"
          placeholder="Tell neighbors what it is, why you're giving it away, and anything they should know."
        />
        <FieldError />
      </TextField>

      <Select isDisabled={isPending} isRequired name="category" placeholder="Choose a category">
        <Label>Category</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {itemCategoryEnum.enumValues.map((value) => (
              <ListBox.Item id={value} key={value} textValue={CATEGORY_LABELS[value]}>
                {CATEGORY_LABELS[value]}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <RadioGroup isDisabled={isPending} isRequired name="condition" orientation="horizontal">
        <Label>Condition</Label>
        {itemConditionEnum.enumValues.map((value) => (
          <Radio key={value} value={value}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {CONDITION_LABELS[value]}
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>

      <RadioGroup isDisabled={isPending} isRequired name="pickupSpotId">
        <Label>Pickup spot</Label>
        {PICKUP_SPOTS.map((spot) => (
          <Radio key={spot.id} value={spot.id}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {spot.label}
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>

      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}

      <Button isPending={isPending} type="submit">
        {({ isPending: pending }) => (
          <>
            {pending ? <Spinner color="current" size="sm" /> : null}
            {pending ? "Posting…" : "Post for free"}
          </>
        )}
      </Button>
    </Form>
  );
}
