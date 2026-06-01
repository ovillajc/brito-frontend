select setval(
  'public.trips_trip_number_seq',
  coalesce((select max(trip_number) from public.trips), 0) + 1,
  false
);