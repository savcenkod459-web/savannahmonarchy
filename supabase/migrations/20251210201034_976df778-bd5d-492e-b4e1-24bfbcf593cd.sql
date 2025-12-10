-- 1. Исправляем политики для translations таблицы (унификация паттерна has_role)

DROP POLICY IF EXISTS "Admins can insert translations" ON translations;
CREATE POLICY "Admins can insert translations" ON translations
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update translations" ON translations;
CREATE POLICY "Admins can update translations" ON translations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete translations" ON translations;
CREATE POLICY "Admins can delete translations" ON translations
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));