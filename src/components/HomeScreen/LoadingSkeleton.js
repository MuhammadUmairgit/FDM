import { Box, Skeleton } from "@mui/material";

export const LoadingSkeleton = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Skeleton variant="rounded" width="60%" height={56} />
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="rounded" width={120} height={56} />
        <Skeleton variant="rounded" width={120} height={56} />
      </Box>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
};

export const BulkEditTableSkeleton = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="rounded" height={40} sx={{ mb: 2 }} />
      {[...Array(5)].map((_, i) => (
        <Box key={i} sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Skeleton variant="rounded" height={40} sx={{ flex: 2 }} />
          <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
        </Box>
      ))}
    </Box>
  );
};
