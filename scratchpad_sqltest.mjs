import { sql } from "drizzle-orm";

const pickupId = "abc-123";
const userId = "user-1";

const query = sql`
  update pickups
  set status = 'confirmed'
  where id = ${pickupId}
    and status = 'proposed'
    and proposed_by <> ${userId}
    and exists (
      select 1 from conversations c
      where c.id = pickups.conversation_id
        and (${userId} = c.giver_id or ${userId} = c.receiver_id)
    )
  returning conversation_id
`;

console.log(JSON.stringify(query.queryChunks, null, 2));
