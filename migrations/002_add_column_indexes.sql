-- Add index to users table to improve performance on queries filtering by user_id
CREATE INDEX idx_users_user_id ON users (user_id);

-- Add indexes to orders table to improve performance on queries supported by the query object
CREATE INDEX idx_orders_instrument_id ON orders (instrument_id);

CREATE INDEX idx_orders_user_id ON orders (user_id);

CREATE INDEX idx_orders_side ON orders (side);

CREATE INDEX idx_orders_status ON orders (status);

-- Add index to marketdata table to improve performance on queries filtering by instrument_id and date
CREATE INDEX idx_marketdata_instrument_id ON marketdata (instrument_id);

CREATE INDEX idx_marketdata_date ON marketdata (date);

-- Add index to instruments table to improve performance on queries filtering by ticker and name
CREATE INDEX idx_instruments_ticker ON instruments (ticker);

CREATE INDEX idx_instruments_name ON instruments (name);