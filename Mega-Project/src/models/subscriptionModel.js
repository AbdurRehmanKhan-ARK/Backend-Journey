import mongoose, { Schema } from "mongoose";

// WHY THIS SCHEMA HAS NO ARRAYS - the core design decision here.
//
// A naive approach might store subscribers as an array directly on
// the User/Channel document (e.g. `subscribers: [ObjectId]`). This
// schema deliberately does NOT do that. Instead, EVERY subscription
// is its own separate document - creating a Many-to-Many relationship
// between users and channels via a join table, much like a junction
// table in relational databases.
//
// Both `subscriber` and `channel` reference the SAME "User" model -
// there's no separate "Channel" model, because in this app, any user
// can BE a channel simply by having subscribers. A document here
// just says: "this subscriber is subscribed to this channel."
//
// EXAMPLE WALKTHROUGH:
// Let a, b, c be Users. Let CAC, HCC be Users acting as channels.
//
// - 'a' subscribes to 'CAC' -> ONE new document created:
//     { subscriber: a, channel: CAC }
// - 'b' also subscribes to 'CAC' -> ANOTHER new document:
//     { subscriber: b, channel: CAC }
// - 'c' also subscribes to 'CAC' -> ANOTHER new document:
//     { subscriber: c, channel: CAC }
//   -> CAC now effectively has 3 subscribers (3 documents exist
//      where channel = CAC), without CAC's own document ever storing
//      an array of who they are.
// - 'c' ALSO subscribes to 'HCC' -> yet another new document:
//     { subscriber: c, channel: HCC }
//   -> this is what makes it Many-to-Many: a single channel can have
//      many subscribers, AND a single subscriber can subscribe to
//      many channels, all without either side holding a growing
//      array
