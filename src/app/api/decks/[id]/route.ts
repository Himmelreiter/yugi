import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const decks = db.collection("decks");

    const result = await decks.deleteOne({
      _id: new ObjectId(params.id),
      userId: session.user.email,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Deck not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Deck deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting deck:", error);
    return NextResponse.json(
      { error: "Failed to delete deck" },
      { status: 500 }
    );
  }
} 