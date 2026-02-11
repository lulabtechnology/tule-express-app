SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Admin inicial:
-- user: admin
-- email: admin@tule-express.local
-- pass: Admin123 (bcrypt)
INSERT INTO admin_users (username, email, password_hash, is_active)
VALUES
('admin', 'admin@tule-express.local', '$2b$12$62YtU9vBmHJEd8g20stO9.f8xczJcjUagazHyTyH/HRgTBBHIIA0C', 1)
ON DUPLICATE KEY UPDATE username=username;

-- Servicios dummy
INSERT INTO services (name, description, duration_minutes, requires_manual_confirmation, is_active, sort_order)
VALUES
('Transporte Escolar', 'Traslados con enfoque en seguridad, cuidado y atención premium.', 60, 1, 1, 10),
('Traslado Ejecutivo', 'Servicio puntual y profesional para traslados corporativos.', 60, 1, 1, 20),
('Viaje Programado', 'Solicitudes para viajes planificados con coordinación previa.', 90, 1, 1, 30);

-- Settings base
INSERT INTO settings (`key`, `value`) VALUES
('site_name', 'Tule Express'),
('timezone', 'America/Panama'),
('whatsapp_e164', '50764349958'),
('slot_policy', 'BLOCK_ONLY_ACCEPTED'),
('store_time', 'UTC')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
