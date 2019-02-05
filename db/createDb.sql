--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6 (Ubuntu 10.6-1.pgdg16.04+1)
-- Dumped by pg_dump version 11.1

-- Started on 2019-02-05 23:08:06 MSK

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4042 (class 1262 OID 9198439)
-- Name: d3fifbt6gie8k2; Type: DATABASE; Schema: -; Owner: zmlfmrzvzulfxh
--

CREATE DATABASE d3fifbt6gie8k2 WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';


ALTER DATABASE d3fifbt6gie8k2 OWNER TO zmlfmrzvzulfxh;

\connect d3fifbt6gie8k2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 86 (class 2615 OID 14682781)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: zmlfmrzvzulfxh
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 101 (class 2615 OID 15629021)
-- Name: backend; Type: SCHEMA; Schema: -; Owner: zmlfmrzvzulfxh
--

CREATE SCHEMA backend;


ALTER SCHEMA backend OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 7 (class 2615 OID 11261449)
-- Name: ws; Type: SCHEMA; Schema: -; Owner: zmlfmrzvzulfxh
--

CREATE SCHEMA ws;


ALTER SCHEMA ws OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 2 (class 3079 OID 13825230)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 4046 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 436 (class 1255 OID 16056679)
-- Name: login(character varying, character varying, text); Type: FUNCTION; Schema: auth; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION auth.login(_provider character varying, _login character varying, _password_hash text DEFAULT NULL::text) RETURNS TABLE(result text, user_id integer, person_name character varying, device_guid uuid, refresh_guid uuid, picture_link character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
   _device_guid uuid; _refresh_guid uuid; _person_id int;
BEGIN

/*check is user exist */
 IF (select count(*) from person where lower(login)=lower(_login)) = 0 THEN
    return query select 'User not found', cast(null as int), cast(null as varchar), cast(null as uuid), cast(null as uuid), cast(null as varchar);
end if;

 _device_guid := uuid_generate_v4();
 _refresh_guid  := uuid_generate_v4();

/*password provider*/
if _provider='password' then
  if (select count(*) from person p where lower(p.login) = lower(_login) and p.password_hash = _password_hash and provider='password' ) = 0 then
   return query select 'Wrong password', cast(null as int), cast(null as varchar), cast(null as uuid), cast(null as uuid), cast(null as varchar);
  else 
         
      select p.person_id into _person_id from person p where lower(p.login)=lower(_login) and password_hash=_password_hash and provider='password';

      insert into person_device (device_guid, refresh_guid, person_id) values (_device_guid, _refresh_guid, _person_id);
     RETURN QUERY SELECT 'Loggined' result, p.person_id, p.person_name, d.device_guid, d.refresh_guid, p.picture_link from person_device d
join person p on p.person_id = d.person_id where lower(p.login) = lower(_login) and d.device_guid = _device_guid and p.provider='password';

  end if;

end if;

/* sspi provider */
if _provider='sspi' then
  if (select count(*) from person p where lower(p.login) = lower(_login) and provider='sspi' ) = 0 then
   return query select 'User not registred', cast(null as int), cast(null as varchar), cast(null as uuid), cast(null as uuid), cast(null as varchar);
  else 
         
      select p.person_id into _person_id from person p where lower(p.login)=lower(_login) and provider='sspi';

      insert into person_device (device_guid, refresh_guid, person_id) values (_device_guid, _refresh_guid, _person_id);
     RETURN QUERY SELECT 'Loggined' result, p.person_id, p.person_name, d.device_guid, d.refresh_guid, p.picture_link from person_device d
join person p on p.person_id = d.person_id where lower(p.login) = lower(_login) and d.device_guid = _device_guid and p.provider='sspi';

  end if;

end if;

   
END;
$$;


ALTER FUNCTION auth.login(_provider character varying, _login character varying, _password_hash text) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 427 (class 1255 OID 14682977)
-- Name: refresh_guid(integer, uuid, uuid); Type: FUNCTION; Schema: auth; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION auth.refresh_guid(_person_id integer, _device_guid uuid, _refresh_guid uuid) RETURNS TABLE(result text, user_id integer, person_name character varying, device_guid uuid, refresh_guid uuid, picture_link character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    _refresh_guid_new uuid;
BEGIN

/*check is valid refresh guid */
 IF (select count(*) from person_device pd where pd.person_id  = _person_id and pd.device_guid = _device_guid and pd.refresh_guid=_refresh_guid and pd.valid_to >=current_timestamp) = 0 THEN
   update person_device set refresh_guid = null where person_device.device_guid = _device_guid and person_device.refresh_guid=_refresh_guid;

    return query select 'Invalid refresh guid', cast(null as int), cast(null as varchar), cast(null as uuid), cast(null as uuid), cast(null as varchar);
else 
       _refresh_guid_new  := uuid_generate_v4();
      update person_device set
   refresh_guid = _refresh_guid_new,
   valid_to = current_timestamp + (60 * interval '1 day')
   where person_device.person_id=_person_id and person_device.device_guid=_device_guid and person_device.refresh_guid=_refresh_guid;


     RETURN QUERY SELECT 'Refreshed' result, 
p.person_id, p.person_name, d.device_guid, d.refresh_guid, p.picture_link from person_device d
join person p on p.person_id = d.person_id 
where d.device_guid = _device_guid;


end if;

   
END;
$$;


ALTER FUNCTION auth.refresh_guid(_person_id integer, _device_guid uuid, _refresh_guid uuid) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 439 (class 1255 OID 16833142)
-- Name: get_execution_params(integer); Type: FUNCTION; Schema: backend; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION backend.get_execution_params(_query_id integer) RETURNS TABLE(query_id integer, error_report_script text, error_person_association_script text, connection_name character varying, config character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
q.query_id, q.error_report_script, q.error_person_association_script, ct.connection_name, 
t.config
FROM
query q
join target t on t.target_id = q.target_id
join connection_type ct on ct.connection_type_id = t.connection_type_id
WHERE
q.query_id = _query_id;
END; $$;


ALTER FUNCTION backend.get_execution_params(_query_id integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 446 (class 1255 OID 17876596)
-- Name: update_query_error(integer, text, timestamp with time zone, text); Type: FUNCTION; Schema: backend; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION backend.update_query_error(_query_id integer, _error_report text, _execution_start timestamp with time zone, _error_person_association text DEFAULT NULL::text) RETURNS TABLE(error_id character varying, error_report text)
    LANGUAGE plpgsql
    AS $$
BEGIN
/* create temp table */
drop table if exists query_error_temp;
create temp table query_error_temp (
 error_id varchar(300),
 error_report text
);
/*add query execution*/
insert into query_execution(query_id, execution_start) values(_query_id, _execution_start);

insert into query_error_temp (error_id, error_report) 
select 
json_extract_path(cast(value as json), 'error_id'), 
value as error_report
from json_array_elements_text(cast(replace(_error_report, '\"', '"') as json));

/*set end date for fixed errors */
update query_error 
set end_date = now()
where 
query_error.query_id = _query_id
and query_error.end_date is null
and (query_error.error_id is null
or query_error.error_id not in (
  select qet.error_id from query_error_temp qet
  where qet.error_id is not null
));

/*update old errors*/
UPDATE query_error
SET error_report = query_error_temp.error_report
FROM
query_error_temp
WHERE
query_error.query_id = _query_id
and query_error.error_id = query_error_temp.error_id
and query_error.end_date is null
and query_error.error_id is not null;


/*insert new errors */
insert into query_error 
(query_id, error_id, start_date, error_report)
select _query_id, qet.error_id, now(), qet.error_report 
from query_error_temp qet
where
qet.error_id not in (
  select query_error.error_id from query_error
  where query_error.error_id is not null 
  and query_error.query_id = _query_id
  and query_error.end_date is null
);

/*Insert dynamic peraon association */

delete from error_person_association 
where query_error_id in (select query_error_id from query_error where query_id=_query_id
and end_date is null);

if _error_person_association is not null then

  insert into error_person_association (query_error_id, person_id)

select distinct qe.query_error_id, p.person_id 
from query_error qe
inner join (select 
lower(replace(cast(json_extract_path(cast(value as json), 'person_id') as varchar), '"', '')) person_id, 
lower(replace(cast(json_extract_path(cast(value as json), 'type') as varchar), '"', '')) as tp, 
cast(json_extract_path(cast(value as json), 'error_id') as varchar) error_id
from json_array_elements_text(cast(replace(_error_person_association, '\"', '"') as json))
) js on js.error_id = qe.error_id
inner join person p on (cast(p.person_id as varchar) = js.person_id and js.tp = 'id') or (lower(p.login) = js.person_id and js.tp = 'login') or (lower(p.email) = js.person_id and js.tp = 'email')
where qe.query_id=_query_id
and qe.end_date is null;

end if; 

/*-------------------------------------------------------*/

return query select qe.error_id, qe.error_report
from query_error qe
where qe.query_id = _query_id 
and qe.end_date is null;

END; $$;


ALTER FUNCTION backend.update_query_error(_query_id integer, _error_report text, _execution_start timestamp with time zone, _error_person_association text) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 454 (class 1255 OID 19890925)
-- Name: get_album_list(integer, integer); Type: FUNCTION; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION public.get_album_list(_year integer, _month integer) RETURNS TABLE(author character varying, title character varying, year integer, month integer, cover_url character varying, genre character varying, listeners integer, playcount integer, google_link character varying, yandex_link character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
a.author,
a.title,
a.year,
a.month,
a.cover_url,
a.genre,
a.listeners,
a.playcount,
a.google_link,
a.yandex_link
from album a
where a.year = _year and a.month = _month;
END; $$;


ALTER FUNCTION public.get_album_list(_year integer, _month integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 450 (class 1255 OID 18520640)
-- Name: add_exception(text, integer, character varying, timestamp with time zone); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.add_exception(_query_error_ids text, _remote_user integer, _comment character varying DEFAULT NULL::character varying, _end_date timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + ((7)::double precision * '1 day'::interval))) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
   _result varchar;
   _exception_limit int;
BEGIN

/*Authorization check*/
if (select count(*) from person p where p.person_id = _remote_user and p.is_administrator = true) = 0 then
 _end_date := current_timestamp + (7* interval '1 day');
  _exception_limit := 15;
end if; 

       /*Check exception limit*/
       IF _exception_limit is null or (select count(*) from 
(select cast(regexp_split_to_table as int) from regexp_split_to_table('1,2,3', ',')) a
left join exception e on e.created_by = _remote_user and e.end_date > now())  <  _exception_limit THEN
       /*Update previous exception*/
          update exception set end_date = now() where query_error_id in (select cast(regexp_split_to_table as int) from regexp_split_to_table('1,2,3', ','));

         insert into exception (query_error_id, start_date, end_date, created_by, comment)
select cast(regexp_split_to_table as int), now(), _end_date, _remote_user, _comment from regexp_split_to_table(_query_error_ids, ',');
         RETURN 'exception added';
       ELSE
           RETURN 'Exception limit reached';
       END IF;
END;
$$;


ALTER FUNCTION ws.add_exception(_query_error_ids text, _remote_user integer, _comment character varying, _end_date timestamp with time zone) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 448 (class 1255 OID 18536520)
-- Name: get_burndown_chart(date, date); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_burndown_chart(_start_date date DEFAULT ((now())::date - 30), _end_date date DEFAULT (now())::date) RETURNS TABLE(report_date date, old_err bigint, new_err bigint, new_rule_err bigint, query_count bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY 
SELECT date,

(select count(*) from query_error qe
left join exception ex on ex.query_error_id = qe.query_error_id
where 
(ex.query_error_id is null or cast(ex.end_date as date) < date or cast(ex.start_date as date) > date)
and (qe.end_date is null or cast(qe.end_date as date) >date) and   cast(qe.start_date as date)<=_start_date
) as old_err,

(select count(*) from query_error qe
join query q on q.query_id = qe.query_id 
left join exception ex on ex.query_error_id = qe.query_error_id
where 
(ex.query_error_id is null or cast(ex.end_date as date) < date or cast(ex.start_date as date) > date)
and (qe.end_date is null or 
     cast(qe.end_date as date) >date) 
and cast(qe.start_date as date)>_start_date
and cast(qe.start_date as date)<=date
and cast(q.created_at as date) <_start_date
) as new_err,

(select count(*) from query_error qe
join query q on q.query_id = qe.query_id 
left join exception ex on ex.query_error_id = qe.query_error_id
where 
(ex.query_error_id is null or cast(ex.end_date as date) < date or cast(ex.start_date as date) > date)
and (qe.end_date is null or 
   cast(qe.end_date as date) >date) 
and cast(qe.start_date as date)>_start_date
and cast(qe.start_date as date)<=date
and cast(q.created_at as date) >=_start_date
) as new_rule_err,

(select count(*) from query q
where 
  cast(q.created_at as date) <=date)
as query_count

from (select cast(date as date) date from   
   generate_series(_start_date, _end_date, 
   cast('1 day' as interval) ) date) d 
order by date;
END; $$;


ALTER FUNCTION ws.get_burndown_chart(_start_date date, _end_date date) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 403 (class 1255 OID 11432679)
-- Name: get_connection_type_list(); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_connection_type_list() RETURNS TABLE(connection_type_id integer, connection_name character varying, config_example character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
c.connection_type_id,
c.connection_name,
c.config_example
from connection_type c;
END; $$;


ALTER FUNCTION ws.get_connection_type_list() OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 451 (class 1255 OID 18536424)
-- Name: get_datasource_error_chart(integer, date, date); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_datasource_error_chart(_datasource_id integer DEFAULT NULL::integer, _start_date date DEFAULT ((now())::date - 30), _end_date date DEFAULT (now())::date) RETURNS TABLE(report_date date, datasource_name character varying, err bigint, old_err bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY 
SELECT date,
ds.datasource_name,
(select count(*) from query_error qe
join query q on q.query_id = qe.query_id
left join exception ex on ex.query_error_id = qe.query_error_id
where 
(ex.query_error_id is null or cast(ex.end_date as date) < date or cast(ex.start_date as date) > date)
and (qe.end_date is null or cast(qe.end_date as date) >date) and   cast(qe.start_date as date)<=date
  and ds.datasource_id = q.datasource_id
  and q.query_status_id = 1
) as err,
(select count(*) from query_error qe
join query q on q.query_id = qe.query_id
left join exception ex on ex.query_error_id = qe.query_error_id
where 
(ex.query_error_id is null or cast(ex.end_date as date) < date or cast(ex.start_date as date) > date)
and (qe.end_date is null or cast(qe.end_date as date) >date) and   cast(qe.start_date as date)<=date
  and ds.datasource_id = q.datasource_id
  and date - cast(qe.start_date as date)  >=7
  and q.query_status_id = 1
) as old_err
from (select cast(date as date) date from   
   generate_series(_start_date, _end_date, 
   cast('1 day' as interval) ) date) d 
join datasource ds on (1=1 and _datasource_id is null) or ds.datasource_id=_datasource_id
order by date, ds.datasource_name;
END; $$;


ALTER FUNCTION ws.get_datasource_error_chart(_datasource_id integer, _start_date date, _end_date date) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 399 (class 1255 OID 12644927)
-- Name: get_datasource_list(); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_datasource_list() RETURNS TABLE(datasource_id integer, datasource_name character varying, datasource_description character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
d.datasource_id, d.datasource_name,
d.datasource_description
from datasource d;
END; $$;


ALTER FUNCTION ws.get_datasource_list() OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 425 (class 1255 OID 18541402)
-- Name: get_datasource_list_with_stat(); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_datasource_list_with_stat() RETURNS TABLE(datasource_id integer, datasource_name character varying, error_count bigint, error_delta bigint, query_count bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
ds.datasource_id, ds.datasource_name, coalesce(er.error_count, 0) error_count, coalesce(er.new_error-er.fixed_error, 0) as error_delta, coalesce(er.query_count, 0) query_count
FROM
datasource ds
left join (select 
   sum (case when qe.end_date is null then 1 else 0 end) error_count,
   sum(case when cast(qe.start_date as date) = cast(now() as date) and qe.end_date is null then 1 else 0 end) new_error,
   sum(case when cast(qe.end_date as date) = cast(now() as date) then 1 else 0 end) fixed_error, 
   q.datasource_id,
count(distinct q.query_id) query_count from query_error qe
left join exception ex on ex.query_error_id = qe.query_error_id and ex.end_date > now()
inner join query q on q.query_id = qe.query_id where  
ex.query_error_id is null
and (qe.end_date is null or cast(qe.end_date as date) = cast(now() as date))
and q.query_status_id=1
group by q.datasource_id) er on er.datasource_id = ds.datasource_id
order by coalesce(er.error_count, 0) desc;
END; $$;


ALTER FUNCTION ws.get_datasource_list_with_stat() OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 445 (class 1255 OID 17372341)
-- Name: get_person(integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_person(_person_id integer) RETURNS TABLE(person_id integer, person_name character varying, email character varying, picture_link character varying, is_administrator boolean, manager_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
       return query select 
p.person_id,
p.person_name,
p.email,
p.picture_link,
p.is_administrator,
p.manager_id
from person p
where p.person_id = _person_id;      
END;
$$;


ALTER FUNCTION ws.get_person(_person_id integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 431 (class 1255 OID 15495975)
-- Name: get_person_error_chart(integer, date, date); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_person_error_chart(_person_id integer DEFAULT NULL::integer, _start_date date DEFAULT ((now())::date - 30), _end_date date DEFAULT (now())::date) RETURNS TABLE(report_date date, person_name character varying, err bigint, old_err bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY 
SELECT date,
p.person_name,
(select count(*) from query_error qe
join query_person_association qpa on qpa.query_id = qe.query_id where 
  (qe.end_date is null or cast(qe.end_date as date) >date) and   cast(qe.start_date as date)<=date
  and p.person_id = qpa.person_id
) as err,
(select count(*) from query_error qe
join query_person_association qpa on qpa.query_id = qe.query_id where 
  (qe.end_date is null or cast(qe.end_date as date) >date) and   cast(qe.start_date as date)<=date
  and p.person_id = qpa.person_id 
and date - cast(qe.start_date as date)  >=7
) as old_err
from (select cast(date as date) date from   
   generate_series(_start_date, _end_date, 
   cast('1 day' as interval) ) date) d 
join person p on p.person_id=_person_id
order by date;
END; $$;


ALTER FUNCTION ws.get_person_error_chart(_person_id integer, _start_date date, _end_date date) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 429 (class 1255 OID 15347393)
-- Name: get_person_list(); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_person_list() RETURNS TABLE(user_id integer, person_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
       return query select p.person_id, p.person_name from person p;      
END;
$$;


ALTER FUNCTION ws.get_person_list() OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 453 (class 1255 OID 18661220)
-- Name: get_person_list_with_stat(integer, integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_person_list_with_stat(_person_id integer DEFAULT NULL::integer, _remote_user integer DEFAULT NULL::integer) RETURNS TABLE(person_id integer, person_name character varying, picture_link character varying, error_count bigint, error_delta bigint, query_count bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
if _remote_user is not null then 
  _person_id := _remote_user;
end if;

RETURN QUERY SELECT
p.person_id, p.person_name, p.picture_link, coalesce(er.error_count, 0) error_count, coalesce(er.new_error-er.fixed_error, 0) as error_delta, coalesce(er.query_count, 0) as query_count
FROM
person p
left join (select 
   sum (case when qe.end_date is null then 1 else 0 end) error_count,
   sum(case when cast(qe.start_date as date) = cast(now() as date) and qe.end_date is null then 1 else 0 end) new_error,
   sum(case when cast(qe.end_date as date) = cast(now() as date) then 1 else 0 end) fixed_error, 
   qpa.person_id,
count(distinct qe.query_id) query_count from query_error qe
inner join query q on q.query_id = qe.query_id
inner join query_person_association qpa on qpa.query_id = qe.query_id 
where  
(qe.end_date is null or cast(qe.end_date as date) = cast(now() as date))
and q.query_status_id=1
group by qpa.person_id) er on er.person_id = p.person_id
where _person_id is null or p.person_id=_person_id
order by coalesce(er.error_count, 0) desc;
END; $$;


ALTER FUNCTION ws.get_person_list_with_stat(_person_id integer, _remote_user integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 426 (class 1255 OID 17350529)
-- Name: get_query(integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_query(_query_id integer) RETURNS TABLE(query_id integer, query_name character varying, query_description character varying, query_justification character varying, query_hint character varying, query_status_id integer, query_status character varying, targetname character varying, datasource_id integer, datasource_name character varying, last_run timestamp with time zone, responsible text, accountable text, informed text, error_count bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN return query
select q.query_id,
q.query_name, 
q.query_description, 
q.query_justification, 
q.query_hint, 
q.query_status_id,
qs.query_status, 
t.target_name, 
q.datasource_id,
d.datasource_name,
(select max(execution_timestamp) from  query_execution qe where qe.query_id=_query_id) last_run,

cast((select '[' || string_agg('{"person_id":' || cast(qpa.person_id as varchar) || ', "person_name":"' || p.person_name || '", "picture_link":"' || coalesce(p.picture_link, '') || '"}', ',') || ']' persons FROM query_person_association qpa
join person p on p.person_id = qpa.person_id
where qpa.association_type_id = 1
and qpa.query_id = _query_id) as text)  responsible,

cast((select '[' || string_agg('{"person_id":' || cast(qpa.person_id as varchar) || ', "person_name":"' || p.person_name || '", "picture_link":"' || coalesce(p.picture_link, '') || '"}', ',') || ']' persons FROM query_person_association qpa
join person p on p.person_id = qpa.person_id
where qpa.association_type_id = 2
and qpa.query_id = _query_id) as text)  accountable,

cast((select '[' || string_agg('{"person_id":' || cast(qpa.person_id as varchar) || ', "person_name":"' || p.person_name || '", "picture_link":"' || coalesce(p.picture_link, '') || '"}', ',') || ']' persons FROM  query_person_association qpa
join person p on p.person_id = qpa.person_id
where qpa.association_type_id = 3
and qpa.query_id = _query_id) as text)  informed,
(select count(*) from query_error qe where qe.end_date is null and qe.query_id = _query_id) error_count

from query q
left join query_status qs on qs.query_status_id = q.query_status_id
left join target t on t.target_id = q.target_id
left join datasource d on d.datasource_id = q.datasource_id
where q.query_id = _query_id;

END;
$$;


ALTER FUNCTION ws.get_query(_query_id integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 440 (class 1255 OID 17350716)
-- Name: get_query_by_schedule(character varying, character varying, time without time zone, time without time zone); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_query_by_schedule(_start_week_day character varying, _end_week_day character varying, _schedule_time_start time without time zone, _schedule_time_end time without time zone) RETURNS TABLE(query_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
   RETURN QUERY SELECT q.query_id
   from query q
   where 
  ((q.mn = true and _start_week_day = 'mn' or
    q.tu = true and _start_week_day = 'tu' or
    q.wd = true and _start_week_day = 'wd' or
    q.th = true and _start_week_day = 'th' or
    q.fr = true and _start_week_day = 'fr' or
    q.sa = true and _start_week_day = 'sa' or
    q.sn = true and _start_week_day = 'sn') 
  or
    (q.mn = true and _end_week_day = 'mn' or
    q.tu = true and _end_week_day = 'tu' or
    q.wd = true and _end_week_day = 'wd' or
    q.th = true and _end_week_day = 'th' or
    q.fr = true and _end_week_day = 'fr' or
    q.sa = true and _end_week_day = 'sa' or
    q.sn = true and _end_week_day = 'sn'))
and cast(coalesce(q.schedule_time, '00:01') as time) >= cast(_schedule_time_start as time)
and cast(coalesce(q.schedule_time, '00:01') as time) < cast(_schedule_time_end as time)
and q.query_status_id =1;
END;
$$;


ALTER FUNCTION ws.get_query_by_schedule(_start_week_day character varying, _end_week_day character varying, _schedule_time_start time without time zone, _schedule_time_end time without time zone) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 447 (class 1255 OID 18515235)
-- Name: get_query_error(integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_query_error(_query_id integer) RETURNS TABLE(query_error_id integer, error_id character varying, error_report text, is_new boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
qe.query_error_id,
qe.error_id,
qe.error_report,
case when cast(qe.start_date as date) = cast(now() as date) then true else false end is_new 
from query_error qe
left join exception ex on ex.query_error_id = qe.query_error_id and ex.end_date > now()
where 
ex.query_error_id is null
and qe.query_id = _query_id
and qe.end_date is null
order by qe.start_date desc;
END; $$;


ALTER FUNCTION ws.get_query_error(_query_id integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 452 (class 1255 OID 18536425)
-- Name: get_query_error_chart(integer, date, date); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_query_error_chart(_query_id integer, _start_date date DEFAULT ((now())::date - 30), _end_date date DEFAULT (now())::date) RETURNS TABLE(report_date date, err bigint, old_err bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT date,
(select count(*) from query_error qe
left join exception ex on ex.query_error_id = qe.query_error_id
where 
(ex.query_error_id is null or cast(ex.end_date as date) < date or cast(ex.start_date as date) > date)
and  (qe.end_date is null or cast(qe.end_date as date) >date) and   cast(qe.start_date as date)<=date
  and qe.query_id=_query_id
) as err,
(select count(*) from query_error qe
left join exception ex on ex.query_error_id = qe.query_error_id
where 
(ex.query_error_id is null or cast(ex.end_date as date) < date or cast(ex.start_date as date) > date)
and   (qe.end_date is null or cast(qe.end_date as date)>date) and   cast(qe.start_date as date)<=date
  and date - cast(qe.start_date as date) >=7
  and qe.query_id=_query_id
) as old_err
from (select cast(date as date) date from   
   generate_series(_start_date, _end_date, 
   cast('1 day' as interval) ) date) d 
order by date;
END; $$;


ALTER FUNCTION ws.get_query_error_chart(_query_id integer, _start_date date, _end_date date) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 441 (class 1255 OID 17353100)
-- Name: get_query_list(integer, integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_query_list(_datasource_id integer DEFAULT NULL::integer, _query_status_id integer DEFAULT 1) RETURNS TABLE(query_id integer, query_name character varying, query_status_id integer, query_status character varying, datasource_name character varying, target_name character varying, error_count bigint, error_delta bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
q.query_id, q.query_name, q.query_status_id, qs.query_status, ds.datasource_name, t.target_name,
coalesce(er.error_count, 0) error_count, coalesce(er.new_error-er.fixed_error, 0) as error_delta
FROM
query q
left join query_status qs on qs.query_status_id = q.query_status_id
left join datasource ds on ds.datasource_id = q.datasource_id
left join target t on t.target_id = q.target_id
left join (select 
   sum (case when qe.end_date is null then 1 else 0 end) error_count,
   sum(case when cast(qe.start_date as date) = cast(now() as date) and qe.end_date is null then 1 else 0 end) new_error,
   sum(case when cast(qe.end_date as date) = cast(now() as date) then 1 else 0 end) fixed_error, 
   qe.query_id from query_error qe where  qe.end_date is null or cast(qe.end_date as date) = cast(now() as date)
group by qe.query_id) er on er.query_id = q.query_id
where (_datasource_id is null or (_datasource_id is not null and q.datasource_id = _datasource_id))
and q.query_status_id=_query_status_id
order by coalesce(er.error_count, 0) desc;
END; $$;


ALTER FUNCTION ws.get_query_list(_datasource_id integer, _query_status_id integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 442 (class 1255 OID 17353113)
-- Name: get_query_list_by_person(integer, integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_query_list_by_person(_person_id integer DEFAULT NULL::integer, _remote_user integer DEFAULT NULL::integer) RETURNS TABLE(query_id integer, query_name character varying, query_status character varying, datasource_name character varying, target_name character varying, error_count bigint, error_delta bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
if _remote_user is not null then 
  _person_id := _remote_user;
end if;

RETURN QUERY SELECT
q.query_id, q.query_name, qs.query_status, ds.datasource_name, t.target_name,
coalesce(er.error_count, 0) as error_count, coalesce(er.new_error-er.fixed_error, 0) as error_delta
FROM
query q
left join query_status qs on qs.query_status_id = q.query_status_id
left join datasource ds on ds.datasource_id = q.datasource_id
left join target t on t.target_id = q.target_id
left join (select 
   sum (case when qe.end_date is null then 1 else 0 end) error_count,
   sum(case when cast(qe.start_date as date) = cast(now() as date) and qe.end_date is null then 1 else 0 end) new_error,
   sum(case when cast(qe.end_date as date) = cast(now() as date) then 1 else 0 end) fixed_error, 
   qe.query_id from query_error qe where  qe.end_date is null or cast(qe.end_date as date) = cast(now() as date)
group by qe.query_id) er on er.query_id = q.query_id
where q.query_id in (select qpa.query_id from query_person_association qpa
where qpa.person_id=_person_id)
order by coalesce(er.error_count, 0) desc;
END; $$;


ALTER FUNCTION ws.get_query_list_by_person(_person_id integer, _remote_user integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 437 (class 1255 OID 16440861)
-- Name: get_query_raw(integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_query_raw(_query_id integer) RETURNS TABLE(query_id integer, query_name character varying, query_description character varying, query_justification character varying, query_hint character varying, query_status_id integer, target_id integer, datasource_id integer, error_report_script text, error_person_association_script text, email_template character varying, mn boolean, tu boolean, wd boolean, th boolean, fr boolean, sa boolean, sn boolean, schedule_time time without time zone, responsible text, accountable text, informed text)
    LANGUAGE plpgsql
    AS $$
BEGIN return query
select q.query_id,
q.query_name, 
q.query_description, 
q.query_justification, 
q.query_hint, 
q.query_status_id, 
q.target_id, 
q.datasource_id, 
q.error_report_script,
q.error_person_association_script,
q.email_template,
q.mn,
q.tu,
q.wd,
q.th,
q.fr,
q.sa,
q.sn,
q.schedule_time,
cast((select '[' || string_agg('{"value":' || cast(qpa.person_id as varchar) || ', "label":"' || p.person_name || '"}', ',') || ']' persons FROM query_person_association qpa
join person p on p.person_id = qpa.person_id
where qpa.association_type_id = 1
and qpa.query_id = _query_id) as text)  responsible,

cast((select '[' || string_agg('{"value":' || cast(qpa.person_id as varchar) || ', "label":"' || p.person_name || '"}', ',') || ']' persons FROM query_person_association qpa
join person p on p.person_id = qpa.person_id
where qpa.association_type_id = 2
and qpa.query_id = _query_id) as text)  accountable,

cast((select '[' || string_agg('{"value":' || cast(qpa.person_id as varchar) || ', "label":"' || p.person_name || '"}', ',') || ']' persons FROM query_person_association qpa
join person p on p.person_id = qpa.person_id
where qpa.association_type_id = 3
and qpa.query_id = _query_id) as text)  informed

from query q
where q.query_id = _query_id;

END;
$$;


ALTER FUNCTION ws.get_query_raw(_query_id integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 400 (class 1255 OID 12753432)
-- Name: get_query_status_list(); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_query_status_list() RETURNS TABLE(query_status_id integer, query_status character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
qs.query_status_id, qs.query_status
from query_status qs;
END; $$;


ALTER FUNCTION ws.get_query_status_list() OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 434 (class 1255 OID 15795285)
-- Name: get_target(integer, integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_target(_target_id integer, _remote_user integer DEFAULT NULL::integer) RETURNS TABLE(target_id integer, target_name character varying, target_description character varying, connection_type_id integer, config character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN

/*Authorization check*/
if (select count(*) from person p where p.person_id = _remote_user and p.is_administrator = true) = 0 then
RAISE EXCEPTION 'Not authorized';
end if; 


   return query select
  t.target_id,
  t.target_name,
  t.target_description,
  t.connection_type_id,
  t.config
  from target t
  where t.target_id=_target_id;
END;
$$;


ALTER FUNCTION ws.get_target(_target_id integer, _remote_user integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 402 (class 1255 OID 11432462)
-- Name: get_target_list(); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_target_list() RETURNS TABLE(target_id integer, target_name character varying, target_description character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT
t.target_id, t.target_name,
t.target_description 
from target t;
END; $$;


ALTER FUNCTION ws.get_target_list() OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 443 (class 1255 OID 17372146)
-- Name: get_team(); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_team() RETURNS TABLE(person_id integer, manager_id integer, person_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN

RETURN QUERY 
WITH RECURSIVE r AS ( 
SELECT p.person_id, p.manager_id, p.person_name 
FROM person p
WHERE p.person_id = 16
UNION 
SELECT p.person_id, p.manager_id, p.person_name 
FROM person p
JOIN r ON p.manager_id = r.person_id ) SELECT * FROM r;
END; $$;


ALTER FUNCTION ws.get_team() OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 444 (class 1255 OID 17372323)
-- Name: get_team(integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_team(_person_id integer) RETURNS TABLE(person_id integer, manager_id integer, person_name character varying)
    LANGUAGE plpgsql
    AS $$
declare 
  _empl_count int;
BEGIN

_empl_count := (select count(*) from person p1 where p1.manager_id = _person_id);
if _person_id is null then
  return query select p.person_id, p.manager_id, p.person_name from person p;
else 
RETURN QUERY 
WITH RECURSIVE r AS ( 
SELECT p.person_id, p.manager_id, p.person_name 
FROM person p
WHERE 
(p.person_id = _person_id and _empl_count>0) or
(p.person_id = (select coalesce(p2.manager_id, p2.person_id) from person p2 where p2.person_id = _person_id) and _empl_count = 0)
UNION 
SELECT p.person_id, p.manager_id, p.person_name 
FROM person p
JOIN r ON p.manager_id = r.person_id ) SELECT * FROM r;
end if;
END; $$;


ALTER FUNCTION ws.get_team(_person_id integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 449 (class 1255 OID 18536649)
-- Name: get_user_error_list_for_email(character varying); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_user_error_list_for_email(_email character varying) RETURNS TABLE(person_id integer, email character varying, error_report text, is_new boolean, query_id integer, query_name character varying, query_description character varying, query_justification character varying, query_hint character varying, email_template character varying, datasource_id integer, datasource_name character varying, association_type_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN

RETURN QUERY with err as (SELECT p.person_id, p.email, 
qe.error_report,
case when cast(qe.start_date as date) = cast(now() as date) then true else false end is_new,
q.query_id,
q.query_name,
q.query_description,
q.query_justification,
q.query_hint,
q.email_template,
ds.datasource_id,
ds.datasource_name,
qpa.association_type_id
from person p
inner join query_person_association qpa on qpa.person_id = p.person_id
inner join query q on q.query_id = qpa.query_id
inner join query_error qe on qe.query_id = q.query_id
join datasource ds on ds.datasource_id = q.datasource_id 
left join exception ex on ex.query_error_id = qe.query_error_id and ex.end_date > now()
where 
ex.query_error_id is null 
and p.email is not null
and lower(p.email) = lower(_email)) 
select * from err 
where ((select count(*) from err err1 where err1.is_new = true) > 0 and err.is_new = true) or (select count(*) from err err2 where err2.is_new = true) = 0
order by random()
limit trunc(random() * 3 + 1);
END; $$;


ALTER FUNCTION ws.get_user_error_list_for_email(_email character varying) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 432 (class 1255 OID 15604680)
-- Name: get_user_list_with_errors(); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.get_user_list_with_errors() RETURNS TABLE(person_id integer, email character varying, error_count numeric, new_error numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN QUERY SELECT p.person_id, p.email, sum(er.error_count) error_count, sum(er.new_error) new_error
from person p
inner join query_person_association qpa on qpa.person_id = p.person_id
inner join query q on q.query_id = qpa.query_id
inner join (select sum (case when qe.end_date is null then 1 else 0 end) error_count,
sum(case when cast(qe.start_date as date) = cast(now() as date) and qe.end_date is null then 1 else 0 end) new_error,
sum(case when cast(qe.end_date as date) = cast(now() as date) then 1 else 0 end) fixed_error, qe.query_id from query_error qe where  qe.end_date is null or cast(qe.end_date as date) = cast(now() as date)
group by qe.query_id) er on er.query_id = q.query_id
where er.error_count > 0
and p.email is not null
group by p.person_id, p.email;
END; $$;


ALTER FUNCTION ws.get_user_list_with_errors() OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 428 (class 1255 OID 14682991)
-- Name: register_user(character varying, character varying, character varying, character varying, character varying, text, integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.register_user(_provider character varying, _person_name character varying, _login character varying, _email character varying, _picture_link character varying DEFAULT NULL::character varying, _password_hash text DEFAULT NULL::text, _manager_id integer DEFAULT NULL::integer) RETURNS TABLE(result text, user_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE _person_id int;
BEGIN
 IF (select count(*) from person where lower(login)=lower(_login)) > 0 THEN
    return query select 'User already exist' result , cast(null as int);
 ELSE
   insert into person (provider,
login,
person_name,
email,
picture_link,
password_hash,
manager_id) 
values (_provider,
_login,
_person_name,
_email,
_picture_link,
_password_hash,
_manager_id) RETURNING person_id INTO _person_id;

   RETURN QUERY SELECT 'User created' result, _person_id;
end if; 

END;
$$;


ALTER FUNCTION ws.register_user(_provider character varying, _person_name character varying, _login character varying, _email character varying, _picture_link character varying, _password_hash text, _manager_id integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 398 (class 1255 OID 11333368)
-- Name: test(character varying); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.test(_test character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN


    return _test;
END;
$$;


ALTER FUNCTION ws.test(_test character varying) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 435 (class 1255 OID 15809865)
-- Name: update_datasource(integer, character varying, character varying, integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.update_datasource(_datasource_id integer DEFAULT 0, _datasource_name character varying DEFAULT NULL::character varying, _datasource_description character varying DEFAULT NULL::character varying, _remote_user integer DEFAULT NULL::integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
   last_id integer;
BEGIN

/*Authorization check*/
if (select count(*) from person p where p.person_id = _remote_user and p.is_administrator = true) = 0 then
RAISE EXCEPTION 'Not authorized';
end if; 


       IF _datasource_id = 0 THEN
         insert into datasource (datasource_name, datasource_description) values (_datasource_name, _datasource_description) RETURNING datasource_id INTO last_id;
         RETURN last_id;
       ELSE
           update datasource set
  datasource_name=_datasource_name,
  datasource_description=_datasource_description
        where datasource_id=_datasource_id;
         return _datasource_id;
       END IF;
END;
$$;


ALTER FUNCTION ws.update_datasource(_datasource_id integer, _datasource_name character varying, _datasource_description character varying, _remote_user integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 430 (class 1255 OID 15399057)
-- Name: update_query(integer, character varying, character varying, character varying, character varying, integer, integer, integer, text, character varying, boolean, boolean, boolean, boolean, boolean, boolean, boolean, time without time zone, character varying, character varying, character varying); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.update_query(_query_id integer DEFAULT 0, _query_name character varying DEFAULT NULL::character varying, _query_description character varying DEFAULT NULL::character varying, _query_justification character varying DEFAULT NULL::character varying, _query_hint character varying DEFAULT NULL::character varying, _query_status_id integer DEFAULT NULL::integer, _target_id integer DEFAULT NULL::integer, _datasource_id integer DEFAULT NULL::integer, _error_report_script text DEFAULT NULL::text, _email_template character varying DEFAULT NULL::character varying, _mn boolean DEFAULT false, _tu boolean DEFAULT false, _wd boolean DEFAULT false, _th boolean DEFAULT false, _fr boolean DEFAULT false, _sa boolean DEFAULT false, _sn boolean DEFAULT false, _schedule_time time without time zone DEFAULT NULL::time without time zone, _responsible character varying DEFAULT NULL::character varying, _accountable character varying DEFAULT NULL::character varying, _informed character varying DEFAULT NULL::character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
   last_id integer;
BEGIN

       IF _query_id = 0 or _query_id is null THEN
         insert into query (query_name, query_description, query_justification, query_hint, query_status_id, target_id, datasource_id, error_report_script, email_template, mn, tu, wd, th, fr, sa, sn, schedule_time) values (_query_name, _query_description, _query_justification, _query_hint, _query_status_id, _target_id, _datasource_id, _error_report_script, _email_template, _mn, _tu, _wd, _th, _fr, _sa, _sn, _schedule_time) RETURNING query_id INTO _query_id;
         RETURN _query_id;
       ELSE 
         IF _query_name is not null then
           update query set query_name = _query_name where query_id = _query_id;
         end if;
         IF _query_description is not null then
           update query set query_description = _query_description where query_id = _query_id;
         end if;
         IF _query_justification is not null then
           update query set query_justification = _query_justification where query_id = _query_id;
         end if;
         IF _query_hint is not null then
           update query set query_hint = _query_hint where query_id = _query_id;
         end if;
         IF _email_template is not null then
           update query set email_template = _email_template where query_id = _query_id;
         end if;
         IF _query_status_id is not null then
           update query set query_status_id = _query_status_id where query_id = _query_id;
         end if;
         IF _target_id is not null then
           update query set target_id = _target_id where query_id = _query_id;
         end if;
         IF _datasource_id is not null then
           update query set datasource_id = _datasource_id where query_id = _query_id;
         end if;
         IF _error_report_script is not null then
           update query set error_report_script = _error_report_script where query_id = _query_id;
         end if;
        
/*UPDATE SCHEDULE*/
  update query set 
  mn=_mn, tu=_tu, wd=_wd, th=_th, fr=_fr, sa=_sa, sn=_sn, schedule_time=_schedule_time
where query_id = _query_id;

        
  END IF;



/*delete all association and update*/
      delete from query_person_association where query_id = _query_id;
      IF _responsible is not null and _responsible not like '' then
         insert into query_person_association(query_id, association_type_id, person_id) select _query_id, 1, cast(regexp_split_to_table as int)   from regexp_split_to_table(_responsible, ',');
    End If;
    IF _accountable is not null and _accountable not like '' then
         insert into query_person_association(query_id, association_type_id, person_id) select _query_id, 2, cast(regexp_split_to_table as int)   from regexp_split_to_table(_accountable, ',');
    End If;
    IF _informed is not null and _informed not like '' then
         insert into query_person_association(query_id, association_type_id, person_id) select _query_id, 3, cast(regexp_split_to_table as int)   from regexp_split_to_table(_informed, ',');
    End If;
    return _query_id;
END;
$$;


ALTER FUNCTION ws.update_query(_query_id integer, _query_name character varying, _query_description character varying, _query_justification character varying, _query_hint character varying, _query_status_id integer, _target_id integer, _datasource_id integer, _error_report_script text, _email_template character varying, _mn boolean, _tu boolean, _wd boolean, _th boolean, _fr boolean, _sa boolean, _sn boolean, _schedule_time time without time zone, _responsible character varying, _accountable character varying, _informed character varying) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 438 (class 1255 OID 16441067)
-- Name: update_query(integer, character varying, character varying, character varying, character varying, integer, integer, integer, text, text, character varying, boolean, boolean, boolean, boolean, boolean, boolean, boolean, time without time zone, character varying, character varying, character varying, integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.update_query(_query_id integer DEFAULT 0, _query_name character varying DEFAULT NULL::character varying, _query_description character varying DEFAULT NULL::character varying, _query_justification character varying DEFAULT NULL::character varying, _query_hint character varying DEFAULT NULL::character varying, _query_status_id integer DEFAULT NULL::integer, _target_id integer DEFAULT NULL::integer, _datasource_id integer DEFAULT NULL::integer, _error_report_script text DEFAULT NULL::text, _error_person_association_script text DEFAULT NULL::text, _email_template character varying DEFAULT NULL::character varying, _mn boolean DEFAULT false, _tu boolean DEFAULT false, _wd boolean DEFAULT false, _th boolean DEFAULT false, _fr boolean DEFAULT false, _sa boolean DEFAULT false, _sn boolean DEFAULT false, _schedule_time time without time zone DEFAULT NULL::time without time zone, _responsible character varying DEFAULT NULL::character varying, _accountable character varying DEFAULT NULL::character varying, _informed character varying DEFAULT NULL::character varying, _remote_user integer DEFAULT NULL::integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
   last_id integer;
BEGIN

/*Authorization check*/
if (select count(*) from person p where p.person_id = _remote_user and p.is_administrator = true) = 0 then
RAISE EXCEPTION 'Not authorized';
end if; 


       IF _query_id = 0 or _query_id is null THEN
         insert into query (query_name, query_description, query_justification, query_hint, query_status_id, target_id, datasource_id, error_report_script, error_person_association_script, email_template, mn, tu, wd, th, fr, sa, sn, schedule_time) values (_query_name, _query_description, _query_justification, _query_hint, _query_status_id, _target_id, _datasource_id, _error_report_script, _error_person_association_script, _email_template, _mn, _tu, _wd, _th, _fr, _sa, _sn, _schedule_time) RETURNING query_id INTO _query_id;
         RETURN _query_id;
       ELSE 
         IF _query_name is not null then
           update query set query_name = _query_name where query_id = _query_id;
         end if;
         IF _query_description is not null then
           update query set query_description = _query_description where query_id = _query_id;
         end if;
         IF _query_justification is not null then
           update query set query_justification = _query_justification where query_id = _query_id;
         end if;
         IF _query_hint is not null then
           update query set query_hint = _query_hint where query_id = _query_id;
         end if;
         IF _email_template is not null then
           update query set email_template = _email_template where query_id = _query_id;
         end if;
         IF _query_status_id is not null then
           update query set query_status_id = _query_status_id where query_id = _query_id;
         end if;
         IF _target_id is not null then
           update query set target_id = _target_id where query_id = _query_id;
         end if;
         IF _datasource_id is not null then
           update query set datasource_id = _datasource_id where query_id = _query_id;
         end if;
         IF _error_report_script is not null then
           update query set error_report_script = _error_report_script where query_id = _query_id;
         end if; 

         if _error_person_association_script is not null then  
           update query set error_person_association_script=_error_person_association_script where query_id = _query_id;
         end if;
        
/*UPDATE SCHEDULE*/
  update query set 
  mn=_mn, tu=_tu, wd=_wd, th=_th, fr=_fr, sa=_sa, sn=_sn, schedule_time=_schedule_time
where query_id = _query_id;

        
  END IF;



/*delete all association and update*/
      delete from query_person_association where query_id = _query_id;
      IF _responsible is not null and _responsible not like '' then
         insert into query_person_association(query_id, association_type_id, person_id) select _query_id, 1, cast(regexp_split_to_table as int)   from regexp_split_to_table(_responsible, ',');
    End If;
    IF _accountable is not null and _accountable not like '' then
         insert into query_person_association(query_id, association_type_id, person_id) select _query_id, 2, cast(regexp_split_to_table as int)   from regexp_split_to_table(_accountable, ',');
    End If;
    IF _informed is not null and _informed not like '' then
         insert into query_person_association(query_id, association_type_id, person_id) select _query_id, 3, cast(regexp_split_to_table as int)   from regexp_split_to_table(_informed, ',');
    End If;
    return _query_id;
END;
$$;


ALTER FUNCTION ws.update_query(_query_id integer, _query_name character varying, _query_description character varying, _query_justification character varying, _query_hint character varying, _query_status_id integer, _target_id integer, _datasource_id integer, _error_report_script text, _error_person_association_script text, _email_template character varying, _mn boolean, _tu boolean, _wd boolean, _th boolean, _fr boolean, _sa boolean, _sn boolean, _schedule_time time without time zone, _responsible character varying, _accountable character varying, _informed character varying, _remote_user integer) OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 433 (class 1255 OID 15795267)
-- Name: update_target(integer, character varying, integer, character varying, character varying, integer); Type: FUNCTION; Schema: ws; Owner: zmlfmrzvzulfxh
--

CREATE FUNCTION ws.update_target(_target_id integer DEFAULT 0, _target_name character varying DEFAULT NULL::character varying, _connection_type_id integer DEFAULT NULL::integer, _config character varying DEFAULT NULL::character varying, _target_description character varying DEFAULT NULL::character varying, _remote_user integer DEFAULT NULL::integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
   last_id integer;
BEGIN

/*Authorization check*/
if (select count(*) from person p where p.person_id = _remote_user and p.is_administrator = true) = 0 then
RAISE EXCEPTION 'Not authorized';
end if; 

       IF _target_id = 0 THEN
         insert into target (target_name, connection_type_id, config, target_description) values (_target_name, _connection_type_id, _config, _target_description) RETURNING target_id INTO last_id;
         RETURN last_id;
       ELSE
           update target set
  target_name=_target_name,
  connection_type_id=_connection_type_id,
config = _config, target_description=_target_description
        where target_id=_target_id;
         return _target_id;
       END IF;
END;
$$;


ALTER FUNCTION ws.update_target(_target_id integer, _target_name character varying, _connection_type_id integer, _config character varying, _target_description character varying, _remote_user integer) OWNER TO zmlfmrzvzulfxh;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 392 (class 1259 OID 15394776)
-- Name: association_type; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.association_type (
    association_type_id integer NOT NULL,
    association_name character varying(100)
);


ALTER TABLE public.association_type OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 391 (class 1259 OID 15394774)
-- Name: association_type_association_type_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.association_type_association_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.association_type_association_type_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4047 (class 0 OID 0)
-- Dependencies: 391
-- Name: association_type_association_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.association_type_association_type_id_seq OWNED BY public.association_type.association_type_id;


--
-- TOC entry 377 (class 1259 OID 11261550)
-- Name: connection_type; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.connection_type (
    connection_type_id integer NOT NULL,
    connection_name character varying(300),
    config_example character varying(500)
);


ALTER TABLE public.connection_type OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 376 (class 1259 OID 11261548)
-- Name: connection_type_connection_type_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.connection_type_connection_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.connection_type_connection_type_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4048 (class 0 OID 0)
-- Dependencies: 376
-- Name: connection_type_connection_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.connection_type_connection_type_id_seq OWNED BY public.connection_type.connection_type_id;


--
-- TOC entry 381 (class 1259 OID 11261638)
-- Name: datasource; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.datasource (
    datasource_id integer NOT NULL,
    datasource_name character varying(300),
    datasource_description character varying(500)
);


ALTER TABLE public.datasource OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 380 (class 1259 OID 11261636)
-- Name: datasource_datasource_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.datasource_datasource_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.datasource_datasource_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4049 (class 0 OID 0)
-- Dependencies: 380
-- Name: datasource_datasource_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.datasource_datasource_id_seq OWNED BY public.datasource.datasource_id;


--
-- TOC entry 394 (class 1259 OID 16833059)
-- Name: error_person_association; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.error_person_association (
    query_error_id integer NOT NULL,
    person_id integer NOT NULL
);


ALTER TABLE public.error_person_association OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 396 (class 1259 OID 18520504)
-- Name: exception; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.exception (
    exception_id integer NOT NULL,
    query_error_id integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_by integer,
    comment character varying(1000)
);


ALTER TABLE public.exception OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 395 (class 1259 OID 18520502)
-- Name: exception_exception_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.exception_exception_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exception_exception_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4050 (class 0 OID 0)
-- Dependencies: 395
-- Name: exception_exception_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.exception_exception_id_seq OWNED BY public.exception.exception_id;


--
-- TOC entry 389 (class 1259 OID 13837739)
-- Name: person; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.person (
    person_id integer NOT NULL,
    provider character varying(300),
    person_name character varying(300),
    email character varying(300),
    picture_link character varying(500),
    is_administrator boolean DEFAULT false,
    password_hash text,
    manager_id integer,
    login character varying(300)
);


ALTER TABLE public.person OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 390 (class 1259 OID 13862990)
-- Name: person_device; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.person_device (
    device_guid uuid NOT NULL,
    person_id integer,
    refresh_guid uuid,
    valid_to timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + ((60)::double precision * '1 day'::interval))
);


ALTER TABLE public.person_device OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 388 (class 1259 OID 13837737)
-- Name: person_person_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.person_person_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.person_person_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4051 (class 0 OID 0)
-- Dependencies: 388
-- Name: person_person_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.person_person_id_seq OWNED BY public.person.person_id;


--
-- TOC entry 383 (class 1259 OID 11261780)
-- Name: query; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.query (
    query_id integer NOT NULL,
    query_name character varying(300),
    query_description character varying(1000),
    query_justification character varying(2000),
    query_hint character varying(2000),
    query_status_id integer,
    datasource_id integer,
    target_id integer,
    error_report_script text,
    email_template character varying(1000),
    mn boolean DEFAULT false,
    tu boolean DEFAULT false,
    wd boolean DEFAULT false,
    th boolean DEFAULT false,
    fr boolean DEFAULT false,
    sa boolean DEFAULT false,
    sn boolean DEFAULT false,
    schedule_time time without time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    error_person_association_script text
);


ALTER TABLE public.query OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 385 (class 1259 OID 11333402)
-- Name: query_error; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.query_error (
    query_error_id integer NOT NULL,
    query_id integer,
    error_id character varying(300),
    object_id character varying(300),
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    error_report text
);


ALTER TABLE public.query_error OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 384 (class 1259 OID 11333400)
-- Name: query_error_query_error_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.query_error_query_error_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.query_error_query_error_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4052 (class 0 OID 0)
-- Dependencies: 384
-- Name: query_error_query_error_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.query_error_query_error_id_seq OWNED BY public.query_error.query_error_id;


--
-- TOC entry 387 (class 1259 OID 11333424)
-- Name: query_execution; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.query_execution (
    query_execution_id integer NOT NULL,
    query_id integer,
    execution_timestamp timestamp with time zone DEFAULT now(),
    execution_start timestamp with time zone
);


ALTER TABLE public.query_execution OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 386 (class 1259 OID 11333422)
-- Name: query_execution_query_execution_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.query_execution_query_execution_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.query_execution_query_execution_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4053 (class 0 OID 0)
-- Dependencies: 386
-- Name: query_execution_query_execution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.query_execution_query_execution_id_seq OWNED BY public.query_execution.query_execution_id;


--
-- TOC entry 393 (class 1259 OID 15394784)
-- Name: query_person_association; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.query_person_association (
    query_id integer NOT NULL,
    person_id integer NOT NULL,
    association_type_id integer NOT NULL
);


ALTER TABLE public.query_person_association OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 382 (class 1259 OID 11261778)
-- Name: query_query_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.query_query_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.query_query_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4054 (class 0 OID 0)
-- Dependencies: 382
-- Name: query_query_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.query_query_id_seq OWNED BY public.query.query_id;


--
-- TOC entry 375 (class 1259 OID 11261443)
-- Name: query_status; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.query_status (
    query_status_id integer NOT NULL,
    query_status character varying(50) NOT NULL
);


ALTER TABLE public.query_status OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 374 (class 1259 OID 11261441)
-- Name: query_status_query_status_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.query_status_query_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.query_status_query_status_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4055 (class 0 OID 0)
-- Dependencies: 374
-- Name: query_status_query_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.query_status_query_status_id_seq OWNED BY public.query_status.query_status_id;


--
-- TOC entry 379 (class 1259 OID 11261609)
-- Name: target; Type: TABLE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE TABLE public.target (
    target_id integer NOT NULL,
    connection_type_id integer,
    config character varying(500),
    target_name character varying(300),
    target_description character varying(500)
);


ALTER TABLE public.target OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 378 (class 1259 OID 11261607)
-- Name: target_target_id_seq; Type: SEQUENCE; Schema: public; Owner: zmlfmrzvzulfxh
--

CREATE SEQUENCE public.target_target_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.target_target_id_seq OWNER TO zmlfmrzvzulfxh;

--
-- TOC entry 4056 (class 0 OID 0)
-- Dependencies: 378
-- Name: target_target_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER SEQUENCE public.target_target_id_seq OWNED BY public.target.target_id;


--
-- TOC entry 3873 (class 2604 OID 15394779)
-- Name: association_type association_type_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.association_type ALTER COLUMN association_type_id SET DEFAULT nextval('public.association_type_association_type_id_seq'::regclass);


--
-- TOC entry 3855 (class 2604 OID 11261553)
-- Name: connection_type connection_type_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.connection_type ALTER COLUMN connection_type_id SET DEFAULT nextval('public.connection_type_connection_type_id_seq'::regclass);


--
-- TOC entry 3857 (class 2604 OID 11261641)
-- Name: datasource datasource_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.datasource ALTER COLUMN datasource_id SET DEFAULT nextval('public.datasource_datasource_id_seq'::regclass);


--
-- TOC entry 3874 (class 2604 OID 18520507)
-- Name: exception exception_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.exception ALTER COLUMN exception_id SET DEFAULT nextval('public.exception_exception_id_seq'::regclass);


--
-- TOC entry 3870 (class 2604 OID 13837742)
-- Name: person person_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.person ALTER COLUMN person_id SET DEFAULT nextval('public.person_person_id_seq'::regclass);


--
-- TOC entry 3858 (class 2604 OID 11261783)
-- Name: query query_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query ALTER COLUMN query_id SET DEFAULT nextval('public.query_query_id_seq'::regclass);


--
-- TOC entry 3867 (class 2604 OID 11333405)
-- Name: query_error query_error_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_error ALTER COLUMN query_error_id SET DEFAULT nextval('public.query_error_query_error_id_seq'::regclass);


--
-- TOC entry 3868 (class 2604 OID 11333427)
-- Name: query_execution query_execution_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_execution ALTER COLUMN query_execution_id SET DEFAULT nextval('public.query_execution_query_execution_id_seq'::regclass);


--
-- TOC entry 3854 (class 2604 OID 11261446)
-- Name: query_status query_status_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_status ALTER COLUMN query_status_id SET DEFAULT nextval('public.query_status_query_status_id_seq'::regclass);


--
-- TOC entry 3856 (class 2604 OID 11261612)
-- Name: target target_id; Type: DEFAULT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.target ALTER COLUMN target_id SET DEFAULT nextval('public.target_target_id_seq'::regclass);


--
-- TOC entry 3894 (class 2606 OID 15394781)
-- Name: association_type association_type_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.association_type
    ADD CONSTRAINT association_type_pkey PRIMARY KEY (association_type_id);


--
-- TOC entry 3878 (class 2606 OID 11261558)
-- Name: connection_type connection_type_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.connection_type
    ADD CONSTRAINT connection_type_pkey PRIMARY KEY (connection_type_id);


--
-- TOC entry 3882 (class 2606 OID 11261643)
-- Name: datasource datasource_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.datasource
    ADD CONSTRAINT datasource_pkey PRIMARY KEY (datasource_id);


--
-- TOC entry 3898 (class 2606 OID 16833063)
-- Name: error_person_association error_person_association_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.error_person_association
    ADD CONSTRAINT error_person_association_pkey PRIMARY KEY (query_error_id, person_id);


--
-- TOC entry 3900 (class 2606 OID 18520512)
-- Name: exception exception_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.exception
    ADD CONSTRAINT exception_pkey PRIMARY KEY (exception_id);


--
-- TOC entry 3892 (class 2606 OID 13862995)
-- Name: person_device person_device_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.person_device
    ADD CONSTRAINT person_device_pkey PRIMARY KEY (device_guid);


--
-- TOC entry 3890 (class 2606 OID 13837748)
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- TOC entry 3886 (class 2606 OID 11333410)
-- Name: query_error query_error_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_error
    ADD CONSTRAINT query_error_pkey PRIMARY KEY (query_error_id);


--
-- TOC entry 3888 (class 2606 OID 11333430)
-- Name: query_execution query_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_execution
    ADD CONSTRAINT query_execution_pkey PRIMARY KEY (query_execution_id);


--
-- TOC entry 3896 (class 2606 OID 15394788)
-- Name: query_person_association query_person_association_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_person_association
    ADD CONSTRAINT query_person_association_pkey PRIMARY KEY (query_id, person_id, association_type_id);


--
-- TOC entry 3884 (class 2606 OID 11261788)
-- Name: query query_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query
    ADD CONSTRAINT query_pkey PRIMARY KEY (query_id);


--
-- TOC entry 3876 (class 2606 OID 11261448)
-- Name: query_status query_status_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_status
    ADD CONSTRAINT query_status_pkey PRIMARY KEY (query_status_id);


--
-- TOC entry 3880 (class 2606 OID 11261617)
-- Name: target target_pkey; Type: CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.target
    ADD CONSTRAINT target_pkey PRIMARY KEY (target_id);


--
-- TOC entry 3913 (class 2606 OID 16833069)
-- Name: error_person_association error_person_association_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.error_person_association
    ADD CONSTRAINT error_person_association_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.person(person_id);


--
-- TOC entry 3912 (class 2606 OID 16833064)
-- Name: error_person_association error_person_association_query_error_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.error_person_association
    ADD CONSTRAINT error_person_association_query_error_id_fkey FOREIGN KEY (query_error_id) REFERENCES public.query_error(query_error_id);


--
-- TOC entry 3915 (class 2606 OID 18520518)
-- Name: exception exception_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.exception
    ADD CONSTRAINT exception_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.person(person_id);


--
-- TOC entry 3914 (class 2606 OID 18520513)
-- Name: exception exception_query_error_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.exception
    ADD CONSTRAINT exception_query_error_id_fkey FOREIGN KEY (query_error_id) REFERENCES public.query_error(query_error_id);


--
-- TOC entry 3908 (class 2606 OID 13862996)
-- Name: person_device person_device_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.person_device
    ADD CONSTRAINT person_device_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.person(person_id);


--
-- TOC entry 3907 (class 2606 OID 13837749)
-- Name: person person_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.person(person_id);


--
-- TOC entry 3903 (class 2606 OID 11261794)
-- Name: query query_datasource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query
    ADD CONSTRAINT query_datasource_id_fkey FOREIGN KEY (datasource_id) REFERENCES public.datasource(datasource_id);


--
-- TOC entry 3905 (class 2606 OID 11333411)
-- Name: query_error query_error_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_error
    ADD CONSTRAINT query_error_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.query(query_id);


--
-- TOC entry 3906 (class 2606 OID 11333431)
-- Name: query_execution query_execution_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_execution
    ADD CONSTRAINT query_execution_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.query(query_id);


--
-- TOC entry 3911 (class 2606 OID 15394799)
-- Name: query_person_association query_person_association_association_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_person_association
    ADD CONSTRAINT query_person_association_association_type_id_fkey FOREIGN KEY (association_type_id) REFERENCES public.association_type(association_type_id);


--
-- TOC entry 3910 (class 2606 OID 15394794)
-- Name: query_person_association query_person_association_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_person_association
    ADD CONSTRAINT query_person_association_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.person(person_id);


--
-- TOC entry 3909 (class 2606 OID 15394789)
-- Name: query_person_association query_person_association_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query_person_association
    ADD CONSTRAINT query_person_association_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.query(query_id);


--
-- TOC entry 3902 (class 2606 OID 11261789)
-- Name: query query_query_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query
    ADD CONSTRAINT query_query_status_id_fkey FOREIGN KEY (query_status_id) REFERENCES public.query_status(query_status_id);


--
-- TOC entry 3904 (class 2606 OID 11261799)
-- Name: query query_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.query
    ADD CONSTRAINT query_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.target(target_id);


--
-- TOC entry 3901 (class 2606 OID 11261618)
-- Name: target target_connection_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zmlfmrzvzulfxh
--

ALTER TABLE ONLY public.target
    ADD CONSTRAINT target_connection_type_id_fkey FOREIGN KEY (connection_type_id) REFERENCES public.connection_type(connection_type_id);


--
-- TOC entry 4043 (class 0 OID 0)
-- Dependencies: 4042
-- Name: DATABASE d3fifbt6gie8k2; Type: ACL; Schema: -; Owner: zmlfmrzvzulfxh
--

REVOKE CONNECT,TEMPORARY ON DATABASE d3fifbt6gie8k2 FROM PUBLIC;


--
-- TOC entry 4044 (class 0 OID 0)
-- Dependencies: 10
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: zmlfmrzvzulfxh
--

REVOKE ALL ON SCHEMA public FROM postgres;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO zmlfmrzvzulfxh;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- TOC entry 4045 (class 0 OID 0)
-- Dependencies: 889
-- Name: LANGUAGE plpgsql; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON LANGUAGE plpgsql TO zmlfmrzvzulfxh;


-- Completed on 2019-02-05 23:08:28 MSK

--
-- PostgreSQL database dump complete
--

