import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, mainDeck, extraDeck, sideDeck } = await req.json();
    
    if (!name || !mainDeck || !extraDeck || !sideDeck) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const decks = db.collection("decks");

    const deck = {
      userId: session.user.email,
      name,
      mainDeck,
      extraDeck,
      sideDeck,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await decks.insertOne(deck);

    return NextResponse.json(
      { message: "Deck saved successfully", deckId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving deck:", error);
    return NextResponse.json(
      { error: "Failed to save deck" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const decks = db.collection("decks");

    const userDecks = await decks
      .find({ userId: session.user.email })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(userDecks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return NextResponse.json(
      { error: "Failed to fetch decks" },
      { status: 500 }
    );
  }
} 