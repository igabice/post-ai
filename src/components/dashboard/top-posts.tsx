'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/app-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TopPosts() {
  const { posts } = useApp();

  const topPosts = useMemo(() => {
    return [...posts]
      .filter((post) => post.status === 'Published')
      .sort((a, b) => b.analytics.impressions - a.analytics.impressions)
      .slice(0, 5);
  }, [posts]);

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
          {topPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <div className="font-medium truncate max-w-xs">{post.title}</div>
              </TableCell>
              <TableCell className="text-right">
                {post.analytics.impressions.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
