package repository

func nullableInt(v int) interface{} {
	if v == 0 {
		return nil
	}
	return v
}

func nullableDate(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
