"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/app-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreatePostButton } from "./create-post-button";

export function TopPosts() {
  const { posts } = useApp();

  const topPosts = useMemo(() => {
    return [...posts]
      .filter((post) => post.status === "Published")
      .sort((a, b) => b.analytics.impressions - a.analytics.impressions)
      .slice(0, 5);
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          You haven't created any posts yet
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Get started by creating a new content plan or your first post.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/generate-plan" passHref>
            <Button>Generate a Plan</Button>
          </Link>
          <CreatePostButton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Post</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topPosts.length > 0 ? (
            topPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="font-medium truncate max-w-xs">
                    {post.title}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {post.analytics.impressions.toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                No published posts yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
