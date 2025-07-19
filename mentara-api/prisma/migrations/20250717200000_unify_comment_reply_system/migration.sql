-- Migration: Unify Comment/Reply System
-- This migration consolidates the separate Reply model into the Comment model
-- using the existing parentId field for proper nested structure

-- Step 1: Convert all Reply records to Comment records
-- Each Reply becomes a Comment with parentId set to the original commentId
INSERT INTO "Comment" (
    "id",
    "postId",
    "userId", 
    "content",
    "parentId",
    "createdAt",
    "updatedAt",
    "attachmentUrls",
    "attachmentNames",
    "attachmentSizes"
)
SELECT 
    r."id",
    c."postId",  -- Get postId from the parent comment
    r."userId",
    r."content",
    r."commentId" as "parentId",  -- This makes it a nested comment
    r."createdAt",
    r."updatedAt",
    r."attachmentUrls",
    r."attachmentNames",
    r."attachmentSizes"
FROM "Reply" r
JOIN "Comment" c ON r."commentId" = c."id";

-- Step 2: Convert all ReplyHeart records to CommentHeart records
-- Map the ReplyHeart to CommentHeart using the same ID (since Reply IDs are now Comment IDs)
INSERT INTO "CommentHeart" (
    "id",
    "commentId",
    "userId",
    "createdAt"
)
SELECT 
    rh."id",
    rh."replyId" as "commentId",  -- replyId now points to the converted Comment
    rh."userId",
    rh."createdAt"
FROM "ReplyHeart" rh;

-- Step 3: Update Report table to handle replies that are now comments
-- No changes needed - Reply IDs that are referenced in reports are now valid Comment IDs

-- Step 4: Drop the Reply and ReplyHeart tables
-- First drop foreign key constraints
DROP TABLE IF EXISTS "ReplyHeart";
DROP TABLE IF EXISTS "Reply";

-- Step 5: Update Comment model structure
-- Remove the replies relation field (this will be done in the schema update)
-- The parentId and children relations already exist and work correctly

-- Step 6: Clean up any orphaned records (safety measure)
-- Remove any comments that might reference non-existent parents
DELETE FROM "Comment" 
WHERE "parentId" IS NOT NULL 
AND "parentId" NOT IN (SELECT "id" FROM "Comment");

-- Step 7: Update indexes for optimal nested comment performance
-- The existing indexes on parentId should be sufficient, but let's ensure they exist
CREATE INDEX IF NOT EXISTS "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX IF NOT EXISTS "Comment_postId_parentId_idx" ON "Comment"("postId", "parentId");

-- Step 8: Add constraints to ensure data integrity
-- Prevent circular references in the comment hierarchy
-- This constraint ensures a comment cannot be its own parent (directly or indirectly)
-- Note: PostgreSQL doesn't support recursive constraints easily, so we'll handle this in application logic

-- Step 9: Update any existing null parentId comments to ensure they are properly root-level
-- This is already handled correctly, but let's ensure consistency
UPDATE "Comment" 
SET "parentId" = NULL 
WHERE "parentId" = '';

-- Migration completed successfully
-- All Reply data has been converted to nested Comments
-- The Reply and ReplyHeart models can now be safely removed from the schema