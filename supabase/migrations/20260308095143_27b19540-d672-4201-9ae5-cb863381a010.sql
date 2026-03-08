
-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'owner', 'customer', 'delivery');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'in_transit', 'delivered', 'return_pending', 'returned', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('prepaid', 'cash_on_delivery');
CREATE TYPE public.payment_status AS ENUM ('pending', 'verified', 'collected', 'refunded');
CREATE TYPE public.settlement_status AS ENUM ('pending', 'settled');
CREATE TYPE public.item_status AS ENUM ('pending_approval', 'active', 'inactive', 'rejected');

-- ==========================================
-- 2. PROFILES
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. USER ROLES
-- ==========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- ==========================================
-- 4. LOCATION HIERARCHY: States > Districts > Panchayaths > Wards
-- ==========================================
CREATE TABLE public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, state_id)
);

CREATE TABLE public.panchayaths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  ward_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, district_id)
);

CREATE TABLE public.wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_number INT NOT NULL,
  panchayath_id UUID NOT NULL REFERENCES public.panchayaths(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ward_number, panchayath_id)
);

-- ==========================================
-- 5. AREAS (group of panchayaths)
-- ==========================================
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.area_panchayaths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  panchayath_id UUID NOT NULL REFERENCES public.panchayaths(id) ON DELETE CASCADE,
  UNIQUE(area_id, panchayath_id)
);

-- ==========================================
-- 6. CATEGORIES & COMMISSION
-- ==========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 7. ITEMS (owned by owners)
-- ==========================================
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  name TEXT NOT NULL,
  description TEXT,
  owner_price NUMERIC(10,2) NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  status item_status NOT NULL DEFAULT 'pending_approval',
  area_id UUID REFERENCES public.areas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 8. DELIVERY CHARGE CONFIG
-- ==========================================
CREATE TABLE public.delivery_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixed_charge NUMERIC(10,2) NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 9. ORDERS
-- ==========================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  delivery_staff_id UUID REFERENCES auth.users(id),
  owner_price NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  delivery_charge NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash_on_delivery',
  status order_status NOT NULL DEFAULT 'pending',
  delivery_address TEXT,
  ward_id UUID REFERENCES public.wards(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 10. PAYMENTS
-- ==========================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  collected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 11. WALLETS
-- ==========================================
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  pending_settlement NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 12. SETTLEMENTS
-- ==========================================
CREATE TABLE public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL,
  status settlement_status NOT NULL DEFAULT 'pending',
  settled_by UUID REFERENCES auth.users(id),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 13. ADMIN AREA ASSIGNMENTS
-- ==========================================
CREATE TABLE public.admin_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  UNIQUE(admin_id, area_id)
);

-- ==========================================
-- 14. DELIVERY STAFF AREA ASSIGNMENTS
-- ==========================================
CREATE TABLE public.delivery_staff_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  UNIQUE(staff_id, area_id)
);

-- ==========================================
-- 15. OWNER AREA ASSIGNMENTS
-- ==========================================
CREATE TABLE public.owner_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  UNIQUE(owner_id, area_id)
);

-- ==========================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKS
-- ==========================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ==========================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mobile)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- AUTO-GENERATE WARDS WHEN WARD_COUNT IS SET
-- ==========================================
CREATE OR REPLACE FUNCTION public.generate_wards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ward_count > 0 AND (OLD.ward_count IS NULL OR NEW.ward_count <> OLD.ward_count) THEN
    DELETE FROM public.wards WHERE panchayath_id = NEW.id;
    FOR i IN 1..NEW.ward_count LOOP
      INSERT INTO public.wards (ward_number, panchayath_id) VALUES (i, NEW.id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_panchayath_ward_count_change
  AFTER INSERT OR UPDATE OF ward_count ON public.panchayaths
  FOR EACH ROW EXECUTE FUNCTION public.generate_wards();

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Profiles: users read own, admins read all
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- User roles: only admins/super_admins manage
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Locations: public read
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read states" ON public.states FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage states" ON public.states FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read districts" ON public.districts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage districts" ON public.districts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.panchayaths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read panchayaths" ON public.panchayaths FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage panchayaths" ON public.panchayaths FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wards" ON public.wards FOR SELECT TO authenticated USING (true);

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read areas" ON public.areas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage areas" ON public.areas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.area_panchayaths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read area_panchayaths" ON public.area_panchayaths FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage area_panchayaths" ON public.area_panchayaths FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Categories: public read
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Items: public read active, owners manage own
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active items" ON public.items FOR SELECT TO authenticated USING (status = 'active' OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners can insert items" ON public.items FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update own items" ON public.items FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Delivery config
ALTER TABLE public.delivery_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read delivery config" ON public.delivery_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage delivery config" ON public.delivery_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid() OR owner_id = auth.uid() OR delivery_staff_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Customers create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Authorized users update orders" ON public.orders FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR delivery_staff_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Create payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System manages wallets" ON public.wallets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Settlements
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own settlements" ON public.settlements FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin manage settlements" ON public.settlements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Area assignments
ALTER TABLE public.admin_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View admin areas" ON public.admin_areas FOR SELECT TO authenticated USING (admin_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin manage admin areas" ON public.admin_areas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.delivery_staff_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View delivery areas" ON public.delivery_staff_areas FOR SELECT TO authenticated USING (staff_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin manage delivery areas" ON public.delivery_staff_areas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

ALTER TABLE public.owner_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View owner areas" ON public.owner_areas FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin manage owner areas" ON public.owner_areas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Insert default delivery config
INSERT INTO public.delivery_config (fixed_charge) VALUES (50);

-- Insert default categories with commission rates
INSERT INTO public.categories (name, commission_rate) VALUES
  ('Dress', 15),
  ('Ornaments', 20),
  ('Electronics', 10),
  ('Tools', 10),
  ('Furniture', 12);

-- Insert default state
INSERT INTO public.states (name) VALUES ('Kerala');
