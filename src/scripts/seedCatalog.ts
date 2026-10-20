import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { ServiceCategory, ServiceCatalog } from '../models';
import { env } from '../config/env';

const MONGO_URI = env.mongodbUri || 'mongodb://localhost:27017/localfix';

export interface CatalogServiceSeedItem {
  name: string;
  description: string;
  defaultPrice: number;
  defaultEta: string;
  mcIcon: string;
  variations: {
    label: string;
    desc: string;
    duration: string;
    defaultPrice: number;
    mcIcon: string;
  }[];
}

export const CATALOG_SEED_DATA: Record<string, CatalogServiceSeedItem[]> = {
  'AC & Cooling': [
    {
      name: 'AC Deep Service & Jet Wash',
      description: 'Comprehensive indoor and outdoor unit jet cleaning, filter wash, and cooling check.',
      defaultPrice: 599,
      defaultEta: '45 mins',
      mcIcon: 'air-conditioner',
      variations: [
        { label: 'Split AC Basic Cleaning', desc: 'Indoor unit filter and tray wash with general cooling check', duration: '30 mins', defaultPrice: 499, mcIcon: 'air-conditioner' },
        { label: 'Split AC Foam & Jet Wash', desc: 'High-pressure water jet and anti-bacterial foam cleaning for indoor and outdoor units', duration: '45 mins', defaultPrice: 699, mcIcon: 'water' },
        { label: 'Window AC Deep Service', desc: 'Complete overhaul, coil descaling and water flush for window units', duration: '45 mins', defaultPrice: 549, mcIcon: 'air-conditioner' },
        { label: 'Dual AC Value Package (2 Units)', desc: 'Jet cleaning and coil decontamination for two AC units', duration: '75 mins', defaultPrice: 1199, mcIcon: 'layers' },
        { label: 'Complete Home AC Service (3+ Units)', desc: 'Comprehensive deep service for 3 or more air conditioners with free gas level diagnosis', duration: '120 mins', defaultPrice: 1699, mcIcon: 'home' },
      ],
    },
    {
      name: 'AC Gas Leak Detection & Refill',
      description: 'Nitrogen pressure testing, leak sealing, and 100% pure R32/R410A refrigerant recharge.',
      defaultPrice: 1899,
      defaultEta: '60 mins',
      mcIcon: 'gas-cylinder',
      variations: [
        { label: 'Gas Top-Up (Minor Leak)', desc: 'Refrigerant top-up up to 20% with valve pressure calibration', duration: '30 mins', defaultPrice: 999, mcIcon: 'gauge' },
        { label: 'Full Gas Refill - Split AC', desc: 'Vacuuming, nitrogen leak test, braze repair, and 100% gas cylinder refill', duration: '60 mins', defaultPrice: 2199, mcIcon: 'gas-cylinder' },
        { label: 'Full Gas Refill - Window AC', desc: 'Complete evacuation and fresh refrigerant recharge for window air conditioners', duration: '45 mins', defaultPrice: 1799, mcIcon: 'gas-cylinder' },
        { label: 'Inverter AC Precision Refill', desc: 'Electronic scale weighed R32/R410A recharge for inverter compressor systems', duration: '60 mins', defaultPrice: 2399, mcIcon: 'tune' },
        { label: 'Advanced Copper Coil Leak Braze', desc: 'Oxygen-acetylene copper joint brazing with pressure hold certification', duration: '75 mins', defaultPrice: 2799, mcIcon: 'fire' },
      ],
    },
    {
      name: 'AC Installation & Uninstallation',
      description: 'Professional wall bracket mounting, copper piping, core drilling, and vacuum commissioning.',
      defaultPrice: 999,
      defaultEta: '90 mins',
      mcIcon: 'wrench',
      variations: [
        { label: 'Split AC Complete Installation', desc: 'Indoor plate mounting, outdoor bracket fitting, piping connection and commissioning', duration: '90 mins', defaultPrice: 1199, mcIcon: 'wrench' },
        { label: 'Split AC Safe Uninstallation', desc: 'Refrigerant pump-down into compressor and safe dismounting of both units', duration: '45 mins', defaultPrice: 699, mcIcon: 'arrow-down-bold' },
        { label: 'Window AC Complete Installation', desc: 'Window frame mounting, sealing, insulation and power testing', duration: '45 mins', defaultPrice: 649, mcIcon: 'window-closed' },
        { label: 'Combo: Uninstallation & Re-Installation', desc: 'Dismount at old location and full remount at new location within premises', duration: '120 mins', defaultPrice: 1599, mcIcon: 'swap-horizontal' },
        { label: 'Outdoor Unit Relocation & Bracket Fix', desc: 'Shift outdoor condensing unit with piping extension check', duration: '60 mins', defaultPrice: 899, mcIcon: 'arrow-expand' },
      ],
    },
    {
      name: 'AC Breakdown & PCB Diagnostics',
      description: 'Troubleshooting for AC not cooling, strange noise, water leakage, or electronic PCB failure.',
      defaultPrice: 349,
      defaultEta: '30 mins',
      mcIcon: 'laptop',
      variations: [
        { label: 'General AC Breakdown Diagnostic', desc: 'Comprehensive component check, sensor diagnostics, and repair quotation', duration: '30 mins', defaultPrice: 299, mcIcon: 'clipboard-pulse' },
        { label: 'Indoor Water Leakage Repair', desc: 'Drain pipe descaling, drain tray realignment, and condensation slope adjustment', duration: '30 mins', defaultPrice: 399, mcIcon: 'water-alert' },
        { label: 'Inverter PCB Motherboard Repair', desc: 'Circuit diagnosis, microcontroller testing, and component replacement', duration: '60 mins', defaultPrice: 1499, mcIcon: 'developer-board' },
        { label: 'Capacitor & Fan Motor Replacement', desc: 'Testing and replacement of faulty run capacitor or blower motor', duration: '45 mins', defaultPrice: 649, mcIcon: 'fan' },
        { label: 'Compressor Contactor & Relay Fix', desc: 'Heavy-duty starting relay diagnosis and contactor terminal overhaul', duration: '45 mins', defaultPrice: 599, mcIcon: 'electric-switch' },
      ],
    },
    {
      name: 'Annual AC Preventive Maintenance',
      description: 'Year-round proactive AC tune-up including scheduled cleaning, filter checks, and priority breakdown cover.',
      defaultPrice: 1499,
      defaultEta: '60 mins',
      mcIcon: 'calendar-check',
      variations: [
        { label: '2-Service Annual Care Plan', desc: 'Two comprehensive wet services per year with electrical safety checks', duration: '60 mins', defaultPrice: 999, mcIcon: 'calendar-month' },
        { label: '3-Service Comprehensive Plan', desc: 'Three wet services per year plus unlimited breakdown inspection visits', duration: '60 mins', defaultPrice: 1499, mcIcon: 'shield-star' },
        { label: 'Pre-Summer AC Health Audit', desc: 'Seasonal full-system diagnostic, amp draw test, and gas pressure audit', duration: '45 mins', defaultPrice: 449, mcIcon: 'weather-sunny' },
        { label: 'Commercial AC AMC (Per Ton)', desc: 'Enterprise cassette/ductable AC monthly maintenance protocol', duration: '90 mins', defaultPrice: 1999, mcIcon: 'office-building' },
        { label: 'Filter Replacement & Anti-Dust Wrap', desc: 'High-density washable filter swap and condenser protection wrap', duration: '30 mins', defaultPrice: 399, mcIcon: 'shield-check' },
      ],
    },
  ],

  'Plumbing': [
    {
      name: 'Tap, Faucet & Shower Repair',
      description: 'Fix dripping taps, loose mixer faucets, clogged showerheads, and cartridge replacements.',
      defaultPrice: 199,
      defaultEta: '30 mins',
      mcIcon: 'pipe-wrench',
      variations: [
        { label: 'Single Tap Leak & Washer Fix', desc: 'Gasket replacement, spindle lubrication, and leak elimination', duration: '20 mins', defaultPrice: 149, mcIcon: 'water-pump' },
        { label: 'Wall Mixer / Diverter Repair', desc: 'Hot & cold mixer cartridge servicing and pressure balance check', duration: '45 mins', defaultPrice: 349, mcIcon: 'tune' },
        { label: 'New Faucet / Tap Installation', desc: 'Precision mounting of new kitchen or washbasin bib cock or pillar cock', duration: '30 mins', defaultPrice: 199, mcIcon: 'plus-circle' },
        { label: 'Overhead Rain Shower Installation', desc: 'Wall/ceiling arm fitting, showerhead assembly and flow testing', duration: '30 mins', defaultPrice: 249, mcIcon: 'shower' },
        { label: 'Full Bathroom Tap Replacement (3-4 Points)', desc: 'Upgrade all basin, shower, and bib taps with leak-proof seals', duration: '60 mins', defaultPrice: 599, mcIcon: 'home-variant' },
      ],
    },
    {
      name: 'Drainage & Pipe Clog Clearance',
      description: 'Heavy-duty mechanical spring and pressure clearance for blocked sinks, toilets, and floor traps.',
      defaultPrice: 399,
      defaultEta: '45 mins',
      mcIcon: 'water',
      variations: [
        { label: 'Kitchen Sink Drainage Unclogging', desc: 'Bottle trap cleaning, grease clearing, and waste pipe rodding', duration: '30 mins', defaultPrice: 299, mcIcon: 'sink' },
        { label: 'Bathroom Floor Drain Unclogging', desc: 'Hair and sediment extraction from floor jali and p-trap', duration: '30 mins', defaultPrice: 349, mcIcon: 'tray' },
        { label: 'Western Toilet Clog Clearance', desc: 'Mechanical auger rodding and siphon line blockage removal', duration: '45 mins', defaultPrice: 499, mcIcon: 'toilet' },
        { label: 'Main Soil Line Heavy Clog Rodding', desc: 'Long-distance mechanical wire snake clearance for exterior sewage lines', duration: '60 mins', defaultPrice: 799, mcIcon: 'format-line-style' },
        { label: 'Balcony / Terrace Drain De-clog', desc: 'Leaves and debris removal from rainwater downpipes', duration: '30 mins', defaultPrice: 399, mcIcon: 'weather-rainy' },
      ],
    },
    {
      name: 'Water Tank & Sump Cleaning',
      description: 'Hygienic high-pressure descaling, sludge vacuuming, and UV/potassium permanganate sterilization.',
      defaultPrice: 899,
      defaultEta: '60 mins',
      mcIcon: 'barrel',
      variations: [
        { label: 'Overhead Tank Cleaning (Up to 1000L)', desc: 'Sludge extraction, deep scrub, high-pressure jet wash, and antibacterial spray', duration: '45 mins', defaultPrice: 699, mcIcon: 'barrel' },
        { label: 'Large Overhead Tank (1500L - 2500L)', desc: 'Full internal decontamination and UV sterilization for high-capacity tanks', duration: '75 mins', defaultPrice: 1099, mcIcon: 'barrel' },
        { label: 'Underground Sump Cleaning (Up to 5000L)', desc: 'De-watering, mechanical floor scrub, sediment vacuuming, and sanitization', duration: '90 mins', defaultPrice: 1499, mcIcon: 'home-roof' },
        { label: 'Combo: Sump + Overhead Tank (Full Home)', desc: 'Complete potable water storage system disinfection package', duration: '120 mins', defaultPrice: 1899, mcIcon: 'layers' },
        { label: 'Auto Float Valve & Tank Sensor Fitting', desc: 'Mechanical brass ball valve or electronic liquid level sensor installation', duration: '30 mins', defaultPrice: 349, mcIcon: 'radiobox-marked' },
      ],
    },
    {
      name: 'Toilet & Flush Tank Servicing',
      description: 'Repair for continuously running flush tanks, dual-flush siphon replacements, and seat fixing.',
      defaultPrice: 299,
      defaultEta: '30 mins',
      mcIcon: 'toilet',
      variations: [
        { label: 'Flush Tank Leakage & Valve Repair', desc: 'Inlet float adjustment and rubber washer replacement to stop continuous trickle', duration: '30 mins', defaultPrice: 249, mcIcon: 'toilet' },
        { label: 'Complete Internal Siphon Kit Replacement', desc: 'Installation of dual-flush mechanism, push button, and overflow valve', duration: '45 mins', defaultPrice: 449, mcIcon: 'cog-sync' },
        { label: 'Toilet Seat Cover Fitting / Replacement', desc: 'Soft-close hydraulic toilet seat cover mounting and bracket alignment', duration: '20 mins', defaultPrice: 199, mcIcon: 'seat' },
        { label: 'Concealed Flush Tank Overhaul', desc: 'Wall-hung concealed cistern servicing without breaking tiles', duration: '60 mins', defaultPrice: 699, mcIcon: 'wall' },
        { label: 'Floor Mount Commode Re-sealing', desc: 'White cement/silicone gap sealing around commode base to eliminate odors', duration: '30 mins', defaultPrice: 299, mcIcon: 'seal' },
      ],
    },
    {
      name: 'Pipe Line Installation & Leak Detection',
      description: 'CPVC, UPVC, and GI concealed waterline tracing, acoustic leak detection, and pipe repairs.',
      defaultPrice: 499,
      defaultEta: '60 mins',
      mcIcon: 'pipe',
      variations: [
        { label: 'Concealed Wall Seepage Diagnosis', desc: 'Moisture meter and acoustic testing to pinpoint hidden pipe fractures', duration: '45 mins', defaultPrice: 399, mcIcon: 'radar' },
        { label: 'Damaged Pipe Section Replacement', desc: 'Cut and solvent-weld replacement CPVC/UPVC pipe and brass coupling', duration: '60 mins', defaultPrice: 599, mcIcon: 'pipe' },
        { label: 'New Waterline Extension (Per 10 Ft)', desc: 'Concealed or surface piping routing with pipe clamps and elbows', duration: '60 mins', defaultPrice: 499, mcIcon: 'ruler' },
        { label: 'Washing Machine Inlet/Outlet Fitting', desc: 'Tap adapter fitting and drain extension for automated washing machines', duration: '25 mins', defaultPrice: 249, mcIcon: 'washing-machine' },
        { label: 'Water Pressure Booster Pump Installation', desc: 'Plumbing connection, check valve assembly and vibration isolation', duration: '75 mins', defaultPrice: 899, mcIcon: 'pump' },
      ],
    },
  ],

  'Electrical': [
    {
      name: 'Wiring & MCB Panel Repair',
      description: 'Safe rewiring, MCB fuse upgrades, load balancing, and short-circuit troubleshooting.',
      defaultPrice: 299,
      defaultEta: '30 mins',
      mcIcon: 'lightning-bolt',
      variations: [
        { label: 'Standard Room Inspection (1-2 Rooms)', desc: 'Check sockets, switches, earthing, and load capacity for up to 2 rooms', duration: '30 mins', defaultPrice: 299, mcIcon: 'lightning-bolt' },
        { label: 'Full House Electrical Health Check', desc: 'Complete comprehensive diagnosis of all circuits, earthing and distribution board', duration: '60 mins', defaultPrice: 599, mcIcon: 'flash' },
        { label: 'Emergency Short Circuit Diagnosis', desc: 'Rapid fault-finding for tripped breakers, burnt wires, and sparking outlets', duration: '45 mins', defaultPrice: 399, mcIcon: 'alert-circle' },
        { label: 'Single MCB Replacement', desc: 'Replace tripping or burnt Miniature Circuit Breaker with brand-new unit', duration: '30 mins', defaultPrice: 249, mcIcon: 'electric-switch' },
        { label: 'Complete Distribution Board (DB) Rewire', desc: 'Main isolator, RCCB, and circuit breaker panel organization and dressing', duration: '90 mins', defaultPrice: 999, mcIcon: 'developer-board' },
      ],
    },
    {
      name: 'Switchboard & Socket Installation',
      description: 'Modular switch replacements, power socket additions, USB ports, and dimmer switches.',
      defaultPrice: 199,
      defaultEta: '30 mins',
      mcIcon: 'power-socket-us',
      variations: [
        { label: 'Single Switch / Socket Replacement', desc: 'Replace broken or burnt 6A/16A modular switch or socket point', duration: '15 mins', defaultPrice: 149, mcIcon: 'power-socket-us' },
        { label: 'Complete Switchboard Installation (6-8 Module)', desc: 'Wire up gang box with switches, sockets, indicator, and fan regulator', duration: '40 mins', defaultPrice: 349, mcIcon: 'view-grid-plus' },
        { label: 'Heavy 16A Power Point for AC/Geyser', desc: 'High-current heat-resistant socket and 20A MCB connection', duration: '45 mins', defaultPrice: 399, mcIcon: 'power-plug' },
        { label: 'Rotary Fan Regulator Replacement', desc: 'Replace humming or faulty speed regulator with step-type control', duration: '20 mins', defaultPrice: 149, mcIcon: 'knob' },
        { label: 'Smart WiFi Switchboard Module Retrofit', desc: 'Install smart relay module behind existing board for mobile/voice control', duration: '45 mins', defaultPrice: 499, mcIcon: 'wifi' },
      ],
    },
    {
      name: 'Ceiling Fan & Exhaust Fan Services',
      description: 'Mounting, balancing, capacitor changes, blade alignment, and noise reduction.',
      defaultPrice: 249,
      defaultEta: '30 mins',
      mcIcon: 'fan',
      variations: [
        { label: 'Ceiling Fan Installation (New Point / Existing)', desc: 'Secure ceiling hook mount, downrod assembly, wiring and speed test', duration: '30 mins', defaultPrice: 249, mcIcon: 'fan' },
        { label: 'Fan Capacitor Replacement & Speed Fix', desc: 'Replace weak capacitor and oil rotor bearing to restore full RPM', duration: '20 mins', defaultPrice: 149, mcIcon: 'speedometer' },
        { label: 'Fan Uninstallation / Relocation', desc: 'Safe dismounting, wiring cap, and repacking of ceiling fan', duration: '20 mins', defaultPrice: 149, mcIcon: 'arrow-down' },
        { label: 'Exhaust Fan Installation (Kitchen/Bathroom)', desc: 'Glass or wall opening mounting, louvre setup, and wiring', duration: '35 mins', defaultPrice: 299, mcIcon: 'fan-chevron-up' },
        { label: 'BLDC Remote Controlled Fan Installation', desc: 'Electronic driver setup, remote pairing, and motor mounting', duration: '40 mins', defaultPrice: 349, mcIcon: 'remote' },
      ],
    },
    {
      name: 'Light Fixture & Chandelier Installation',
      description: 'Mounting chandeliers, LED strip lights, focus spotlights, wall sconces, and batten lights.',
      defaultPrice: 299,
      defaultEta: '40 mins',
      mcIcon: 'ceiling-light',
      variations: [
        { label: 'Standard LED Tube / Batten Fitting', desc: 'Drilling, anchor mounting, and direct connection for tube lights', duration: '20 mins', defaultPrice: 149, mcIcon: 'minus' },
        { label: 'Concealed False Ceiling Spotlights (Set of 4)', desc: 'Spring clip fitting and driver wiring for recessed ceiling lights', duration: '45 mins', defaultPrice: 349, mcIcon: 'dots-horizontal' },
        { label: 'Designer Wall Sconce / Mirror Light', desc: 'Precision leveling and aesthetic bracket mounting for wall lights', duration: '30 mins', defaultPrice: 249, mcIcon: 'wall-sconce' },
        { label: 'Chandelier Assembly & Ceiling Mounting', desc: 'Heavy anchor bolt fastening, crystal chain assembly, and balance check', duration: '60 mins', defaultPrice: 799, mcIcon: 'chandelier' },
        { label: 'Cove LED Profile Strip Installation (Per 10 Ft)', desc: 'Aluminum profile fitting, diffuser clip, and SMPS power connection', duration: '60 mins', defaultPrice: 499, mcIcon: 'ray-start' },
      ],
    },
    {
      name: 'Inverter & Battery Wiring Setup',
      description: 'Home UPS inverter wiring, dual battery connections, bypass switches, and backup testing.',
      defaultPrice: 599,
      defaultEta: '60 mins',
      mcIcon: 'battery-charging',
      variations: [
        { label: 'New Home Inverter & Battery Installation', desc: 'AC mains input connection, DC terminal setup, and inverter output wiring', duration: '60 mins', defaultPrice: 599, mcIcon: 'battery-charging' },
        { label: 'Inverter Battery Terminal Cleaning & Water Top-Up', desc: 'De-sulfation terminal scrub, petroleum jelly coating, and distilled water fill', duration: '30 mins', defaultPrice: 249, mcIcon: 'car-battery' },
        { label: 'Inverter Bypass Switch Installation', desc: 'Manual rotary changeover switch for uninterrupted power during inverter repair', duration: '45 mins', defaultPrice: 449, mcIcon: 'swap-horizontal' },
        { label: 'Dual Battery Tubular Series Setup', desc: 'Heavy 24V busbar connection and high-amperage cable crimping', duration: '60 mins', defaultPrice: 799, mcIcon: 'battery-charging-100' },
        { label: 'Complete Home Backup Rewiring', desc: 'Segregate essential emergency lights and fans onto inverter output circuit', duration: '90 mins', defaultPrice: 999, mcIcon: 'home-lightning-bolt' },
      ],
    },
  ],

  'Cleaning': [
    {
      name: 'Full Home Deep Cleaning',
      description: 'Complete floor scrubbing, window cleaning, kitchen descaling, and bathroom sanitization.',
      defaultPrice: 2499,
      defaultEta: '180 mins',
      mcIcon: 'spray-bottle',
      variations: [
        { label: '1 BHK Complete Deep Cleaning', desc: 'Single bedroom, hall, kitchen, and bathroom machine scrubbing and sanitization', duration: '150 mins', defaultPrice: 1999, mcIcon: 'home' },
        { label: '2 BHK Comprehensive Deep Clean', desc: 'Two bedrooms, living room, modular kitchen, and 2 bathrooms deep cleaned', duration: '210 mins', defaultPrice: 2699, mcIcon: 'home-variant' },
        { label: '3 BHK Premium Deep Clean', desc: 'Three bedrooms, large balcony, all bathrooms, kitchen degreasing, and cobweb removal', duration: '270 mins', defaultPrice: 3499, mcIcon: 'home-city' },
        { label: 'Furnished Villa / Duplex Deep Clean', desc: 'Multistory residential thorough cleaning with high-reach glass and terrace', duration: '360 mins', defaultPrice: 4999, mcIcon: 'domain' },
        { label: 'Move-in / Move-out Vacant Home Clean', desc: 'Empty house thorough detailing including wardrobes, lofts, and switchboards', duration: '180 mins', defaultPrice: 2299, mcIcon: 'truck-delivery' },
      ],
    },
    {
      name: 'Kitchen Deep Degreasing',
      description: 'Exhaust fan, tiles, countertops, sink, and modular cabinets grease removal and buffing.',
      defaultPrice: 899,
      defaultEta: '90 mins',
      mcIcon: 'pot-steam',
      variations: [
        { label: 'Standard Kitchen Deep Clean', desc: 'Degrease countertops, sink, tile backsplashes, and cabinet exteriors', duration: '75 mins', defaultPrice: 799, mcIcon: 'sink' },
        { label: 'Heavy Grease & Chimney Exterior Scrub', desc: 'Industrial degreaser scrub for oily tiles, exhaust fan, and kitchen surfaces', duration: '105 mins', defaultPrice: 1199, mcIcon: 'fire' },
        { label: 'Full Modular Kitchen Detail (Inside & Out)', desc: 'Empty cabinet interior wipe, drawer track cleaning, and exterior polish', duration: '120 mins', defaultPrice: 1499, mcIcon: 'cupboard' },
        { label: 'Kitchen Appliance Detailing (Oven + Fridge + Hob)', desc: 'Interior steam clean of microwave, refrigerator trays, and 4-burner gas hob', duration: '60 mins', defaultPrice: 699, mcIcon: 'microwave' },
        { label: 'Kitchen Floor & Tile Grout Descaling', desc: 'Rotary scrubbing of oily floor tiles and chemical grout whitening', duration: '45 mins', defaultPrice: 499, mcIcon: 'border-all' },
      ],
    },
    {
      name: 'Bathroom Deep Stain & Limescale Removal',
      description: 'Hard water stain removal from tiles, glass shower partitions, commode, and chrome fixtures.',
      defaultPrice: 499,
      defaultEta: '60 mins',
      mcIcon: 'shower-head',
      variations: [
        { label: 'Single Bathroom Deep Cleaning', desc: 'Floor & wall tile descaling, WC sanitization, mirror buffing, and chrome polish', duration: '45 mins', defaultPrice: 449, mcIcon: 'toilet' },
        { label: 'Two Bathrooms Value Package', desc: 'Complete sanitization and hard water stain removal for 2 bathrooms', duration: '90 mins', defaultPrice: 799, mcIcon: 'layers' },
        { label: 'Three Bathrooms Family Pack', desc: 'Full sanitization, limescale scrubbing, and drain disinfection for 3 bathrooms', duration: '135 mins', defaultPrice: 1099, mcIcon: 'home-variant' },
        { label: 'Glass Shower Cubicle Descaling', desc: 'Intensive chemical treatment to eliminate calcium deposits on glass doors', duration: '30 mins', defaultPrice: 349, mcIcon: 'glass-fragile' },
        { label: 'Tile Grout Re-whitening & Acid Wash', desc: 'Safe acid-wash removal of yellow grout stains and mold', duration: '45 mins', defaultPrice: 399, mcIcon: 'brush' },
      ],
    },
    {
      name: 'Sofa & Upholstery Shampooing',
      description: 'Industrial wet-and-dry vacuum extraction, fabric stain remover, and deodorizing.',
      defaultPrice: 799,
      defaultEta: '60 mins',
      mcIcon: 'sofa',
      variations: [
        { label: '3-Seater Fabric Sofa Shampoo', desc: 'Foam injection, dirt agitation, and industrial suction extraction', duration: '45 mins', defaultPrice: 699, mcIcon: 'sofa' },
        { label: '5-Seater Living Room Sofa Set', desc: 'Deep shampoo for 3+1+1 or 5-seater sofa set with free throw cushion clean', duration: '75 mins', defaultPrice: 1099, mcIcon: 'sofa' },
        { label: '7-Seater / L-Shaped Sectional Sofa', desc: 'Intensive stain removal and suction extraction for large sectional sofas', duration: '90 mins', defaultPrice: 1499, mcIcon: 'seat-recline-extra' },
        { label: 'Dining Chair Fabric Seats (Set of 4-6)', desc: 'Stain treatment and extraction for cushioned dining room chairs', duration: '45 mins', defaultPrice: 499, mcIcon: 'chair-rolling' },
        { label: 'Leather Sofa Conditioning & Polish', desc: 'PH-balanced leather cleaner and rich cream moisturizer polish', duration: '45 mins', defaultPrice: 899, mcIcon: 'shield-star' },
      ],
    },
    {
      name: 'Mattress & Carpet Deep Sanitization',
      description: 'Anti-allergen high-power suction, dust mite UV extraction, and deodorizing shampoo.',
      defaultPrice: 899,
      defaultEta: '60 mins',
      mcIcon: 'bed',
      variations: [
        { label: 'Single Mattress Deep Clean', desc: 'Dual-sided suction extraction, stain treatment, and UV sanitization', duration: '35 mins', defaultPrice: 599, mcIcon: 'bed-empty' },
        { label: 'Queen / King Size Mattress Deep Clean', desc: 'Full dual-sided shampoo extraction and dust-mite allergen elimination', duration: '60 mins', defaultPrice: 899, mcIcon: 'bed-double' },
        { label: 'Small Living Room Carpet (Up to 5x7 Ft)', desc: 'High-power dry vacuum and deep foam shampoo wash', duration: '45 mins', defaultPrice: 649, mcIcon: 'rug' },
        { label: 'Large Area Rug / Carpet (Up to 8x10 Ft)', desc: 'Rotary brushing, deep wash, and water extraction for large rugs', duration: '75 mins', defaultPrice: 1099, mcIcon: 'rug' },
        { label: 'Combo: King Mattress + Living Room Rug', desc: 'Complete bedroom & living room fabric sanitization package', duration: '105 mins', defaultPrice: 1499, mcIcon: 'layers' },
      ],
    },
  ],

  'Painting': [
    {
      name: 'Interior Wall Painting & Touch-up',
      description: 'Puddle putty repair, primer coat, and premium acrylic emulsion paint application.',
      defaultPrice: 2999,
      defaultEta: '240 mins',
      mcIcon: 'format-paint',
      variations: [
        { label: 'Single Room Accent Wall Painting', desc: 'Two coats of royal emulsion or textured paint on a feature wall', duration: '120 mins', defaultPrice: 1499, mcIcon: 'wall' },
        { label: '1 BHK Complete Interior Painting', desc: 'Ceiling and walls 2 coats with surface putty preparation', duration: '1-2 Days', defaultPrice: 8999, mcIcon: 'home' },
        { label: '2 BHK Complete Interior Painting', desc: 'Two bedrooms, living, dining, and kitchen painting with floor covering', duration: '2-3 Days', defaultPrice: 14999, mcIcon: 'home-variant' },
        { label: '3 BHK Luxury Interior Painting', desc: 'Complete 3 BHK wall sanding, primer, and washable luxury emulsion coats', duration: '3-4 Days', defaultPrice: 21999, mcIcon: 'home-city' },
        { label: 'Wall Patch & Crack Touch-up Work', desc: 'Repair peeling paint, plaster cracks, nail holes, and color matching', duration: '90 mins', defaultPrice: 999, mcIcon: 'bandage' },
      ],
    },
    {
      name: 'Waterproof Dampproofing Treatment',
      description: 'Anti-fungal polymer coating, elastomeric membrane, and exterior wall moisture barriers.',
      defaultPrice: 1999,
      defaultEta: '120 mins',
      mcIcon: 'water-off',
      variations: [
        { label: 'Bathroom Seepage Wall Barrier', desc: 'Chemical injection and waterproof polymer barrier coating on damp walls', duration: '90 mins', defaultPrice: 1699, mcIcon: 'water-off' },
        { label: 'Balcony / Terrace Waterproof Coating', desc: 'Elastomeric thick membrane coat with UV and crack-bridging resistance', duration: '180 mins', defaultPrice: 3499, mcIcon: 'umbrella' },
        { label: 'Skirting Level Rising Damp Treatment', desc: 'Anti-efflorescence salt neutralizer and crystalline waterproofing', duration: '120 mins', defaultPrice: 2199, mcIcon: 'wall-sconce' },
        { label: 'Ceiling Seepage Repair & Anti-Mold Shield', desc: 'Scrape moldy plaster, apply water-lock sealant and anti-mold paint', duration: '90 mins', defaultPrice: 1499, mcIcon: 'ceiling-light' },
        { label: 'Exterior Parapet Wall Waterproofing', desc: 'Crack sealing and fiber-reinforced waterproof elastomeric coat', duration: '240 mins', defaultPrice: 4499, mcIcon: 'shield-half-full' },
      ],
    },
    {
      name: 'Wood Polishing & Melamine Finish',
      description: 'Sanding, wood filler, stain matching, PU and melamine clear/gloss coatings.',
      defaultPrice: 1499,
      defaultEta: '120 mins',
      mcIcon: 'brush',
      variations: [
        { label: 'Main Entrance Wooden Door Polish', desc: 'Complete sanding and rich natural teak melamine or PU gloss polish', duration: '120 mins', defaultPrice: 1299, mcIcon: 'door' },
        { label: 'Dining Table & Chair Set Polishing', desc: 'Tabletop scratch removal, stain color matching, and protective topcoat', duration: '180 mins', defaultPrice: 2499, mcIcon: 'table-furniture' },
        { label: 'Wooden Wardrobe Exterior Refresh', desc: 'Hand-buffed French polish or matte PU clear coat for wardrobes', duration: '150 mins', defaultPrice: 1899, mcIcon: 'cupboard' },
        { label: 'Teak Wood Furniture Touch-up & Wax', desc: 'Beeswax nourish and minor scuff mark buffing across home furniture', duration: '60 mins', defaultPrice: 799, mcIcon: 'brush' },
        { label: 'Wooden Window Frame & Shutter Polish', desc: 'Weather-resistant external PU clear varnish for wooden window frames', duration: '90 mins', defaultPrice: 1099, mcIcon: 'window-closed' },
      ],
    },
    {
      name: 'Metal Gate & Grill Enamel Painting',
      description: 'Rust scraping, red oxide anti-rust primer, and synthetic high-gloss enamel painting.',
      defaultPrice: 999,
      defaultEta: '90 mins',
      mcIcon: 'gate',
      variations: [
        { label: 'Balcony Safety Grill Enamel Painting', desc: 'Wire brush rust removal, red oxide zinc chromate primer, and 2 gloss coats', duration: '90 mins', defaultPrice: 899, mcIcon: 'balcony' },
        { label: 'Main Entrance Iron Gate Painting', desc: 'Rust converter treatment and premium black/metallic synthetic enamel', duration: '150 mins', defaultPrice: 1599, mcIcon: 'gate' },
        { label: 'Window Safety Grills (Set of 3)', desc: 'Complete rust scraping and dual coats of satin/gloss enamel paint', duration: '120 mins', defaultPrice: 1199, mcIcon: 'window-open' },
        { label: 'Spiral Staircase Metal Railing Paint', desc: 'Handrail surface prep, anti-rust coat, and durable top enamel', duration: '180 mins', defaultPrice: 1999, mcIcon: 'stairs' },
        { label: 'Air Conditioner Outdoor Cage Painting', desc: 'Anti-corrosion protective zinc spray and weather-resistant coating', duration: '45 mins', defaultPrice: 499, mcIcon: 'shield' },
      ],
    },
    {
      name: 'Decorative Wall Texture & Stencil Art',
      description: 'Metallic wall textures, geometric stencils, Venetian plaster, and custom artistic finishes.',
      defaultPrice: 2499,
      defaultEta: '180 mins',
      mcIcon: 'palette',
      variations: [
        { label: 'Metallic Wave / Spatula Wall Texture', desc: 'Trowel application of metallic glaze creating high-end 3D texture', duration: '180 mins', defaultPrice: 2499, mcIcon: 'texture' },
        { label: 'Designer Wall Stencil Pattern (1 Wall)', desc: 'Precision stencil alignment with contrasting washable acrylic colors', duration: '120 mins', defaultPrice: 1499, mcIcon: 'drawing' },
        { label: 'Rustic Brick Wall Faux Finish', desc: 'Plaster carving and multi-shade coloring imitating vintage brickwork', duration: '240 mins', defaultPrice: 3499, mcIcon: 'wall' },
        { label: 'Kids Room Theme Mural / Cartoon Accent', desc: 'Vibrant non-toxic playful artistic wall paint design', duration: '180 mins', defaultPrice: 2999, mcIcon: 'emoticon-happy' },
        { label: 'Italian Venetian Marble Plaster Finish', desc: 'Ultra-smooth mirror shine polished plaster wall finish', duration: '300 mins', defaultPrice: 4999, mcIcon: 'diamond-stone' },
      ],
    },
  ],

  'Carpentry': [
    {
      name: 'Door & Lock Repair & Installation',
      description: 'Fix sticking doors, mortise handle replacement, smart door lock fitting, and hinge alignment.',
      defaultPrice: 299,
      defaultEta: '45 mins',
      mcIcon: 'door',
      variations: [
        { label: 'Door Lock / Mortise Handle Replacement', desc: 'Precision chiseling, latch mechanism fitting, and key alignment', duration: '45 mins', defaultPrice: 349, mcIcon: 'lock' },
        { label: 'Smart Digital Door Lock Installation', desc: 'Electronic template routing, motor deadbolt installation, and setup', duration: '75 mins', defaultPrice: 899, mcIcon: 'cellphone-key' },
        { label: 'Door Planing & Sticking Edge Shave', desc: 'Planer wood shaving to solve floor scraping and swollen monsoon doors', duration: '30 mins', defaultPrice: 249, mcIcon: 'door-open' },
        { label: 'Hydraulic Door Closer Installation', desc: 'Overhead door closer bracket mounting and swing speed adjustment', duration: '30 mins', defaultPrice: 299, mcIcon: 'ray-end' },
        { label: 'Door Stopper & Tower Bolt Fitting', desc: 'Heavy brass magnetic floor stopper and sliding bolt installation', duration: '20 mins', defaultPrice: 149, mcIcon: 'pin' },
      ],
    },
    {
      name: 'Modular Furniture Assembly',
      description: 'Expert assembly of flat-pack wardrobes, study desks, beds, and TV entertainment units.',
      defaultPrice: 499,
      defaultEta: '60 mins',
      mcIcon: 'hammer',
      variations: [
        { label: 'Double Bed / Queen Bed Assembly', desc: 'Headboard, side rails, slat support, and hydraulic storage box assembly', duration: '75 mins', defaultPrice: 699, mcIcon: 'bed' },
        { label: '2-Door / 3-Door Wardrobe Assembly', desc: 'Carcass alignment, backboard tacking, shelf fitting, and door hinges', duration: '90 mins', defaultPrice: 999, mcIcon: 'cupboard' },
        { label: 'Study Table & Ergonomic Office Desk', desc: 'Leg frame fastening, drawer slider assembly, and cable grommet fit', duration: '45 mins', defaultPrice: 449, mcIcon: 'desk' },
        { label: 'Wall Mount TV Unit / Entertainment Center', desc: 'Heavy anchor masonry drilling, level checking, and floating unit mount', duration: '60 mins', defaultPrice: 599, mcIcon: 'television' },
        { label: 'Bookshelf & Shoe Rack Assembly', desc: 'Multi-tier shoe cabinet or display bookshelf cam-lock assembly', duration: '45 mins', defaultPrice: 399, mcIcon: 'bookshelf' },
      ],
    },
    {
      name: 'Kitchen Cabinet & Drawer Channel Repair',
      description: 'Hydraulic hinge replacement, soft-close drawer slides, and cabinet door realignment.',
      defaultPrice: 299,
      defaultEta: '30 mins',
      mcIcon: 'toolbox',
      variations: [
        { label: 'Soft-Close Concealed Hinge Swap (Pair)', desc: 'Replace rusted or sagging hinges with 3D adjustable soft-close hinges', duration: '25 mins', defaultPrice: 199, mcIcon: 'rotate-3d-variant' },
        { label: 'Telescopic Drawer Channel Replacement', desc: 'Heavy-duty ball bearing slider channel fitting and smooth roll test', duration: '40 mins', defaultPrice: 349, mcIcon: 'format-horizontal-align-left' },
        { label: 'Overhead Cabinet Hydraulic Lift-up Arm', desc: 'Gas piston pneumatic strut replacement for top-opening shutters', duration: '30 mins', defaultPrice: 299, mcIcon: 'arrow-up-bold-box' },
        { label: 'Cabinet Handle & Knob Upgrades (Up to 5)', desc: 'Precision drill template and modern brass/matte handle installation', duration: '30 mins', defaultPrice: 199, mcIcon: 'hand-back-right' },
        { label: 'Kitchen Trolley Wire Basket Realignment', desc: 'Adjust stainless steel cutlery or thali basket rollers and stoppers', duration: '30 mins', defaultPrice: 249, mcIcon: 'basket' },
      ],
    },
    {
      name: 'Wall Shelving & Decor Hanging',
      description: 'Hanging heavy mirrors, wall art, floating shelves, curtain rods, and brackets.',
      defaultPrice: 249,
      defaultEta: '30 mins',
      mcIcon: 'wall',
      variations: [
        { label: 'Curtain Rod / Track Installation (Per Window)', desc: 'Wall/ceiling bracket masonry drilling and rod level mounting', duration: '25 mins', defaultPrice: 199, mcIcon: 'blinds' },
        { label: 'Floating Wall Shelf Fitting (Set of 2-3)', desc: 'Concealed rod bracket mounting with laser leveling', duration: '40 mins', defaultPrice: 349, mcIcon: 'bookshelf' },
        { label: 'Heavy Wall Mirror / Large Artwork Hanging', desc: 'Heavy-duty wall anchors, D-rings, and secure center-of-wall hanging', duration: '30 mins', defaultPrice: 249, mcIcon: 'image-frame' },
        { label: 'Photo Frame Gallery Wall (Up to 5 Frames)', desc: 'Grid alignment, aesthetic spacing, and wall anchor placement', duration: '45 mins', defaultPrice: 299, mcIcon: 'view-gallery' },
        { label: 'Bathroom Accessory Set Fitting (5 Pieces)', desc: 'Towel rod, soap dispenser, tumbler holder, and robe hook installation', duration: '40 mins', defaultPrice: 349, mcIcon: 'shower' },
      ],
    },
    {
      name: 'Custom Woodwork & Plywood Partition',
      description: 'Bespoke shelving, room dividers, loft framing, and wooden casing fabrication.',
      defaultPrice: 999,
      defaultEta: '120 mins',
      mcIcon: 'saw-blade',
      variations: [
        { label: 'Storage Loft Wooden Framing & Shutters', desc: 'Commercial ply framing and laminate finish overhead loft doors', duration: '1-2 Days', defaultPrice: 2999, mcIcon: 'home-roof' },
        { label: 'Drywall / Plywood Room Partition Frame', desc: 'Timber stud framing and acoustic insulated wood paneling', duration: '1-2 Days', defaultPrice: 4999, mcIcon: 'wall' },
        { label: 'AC Pipe / Electrical Wire Wooden Boxing', desc: 'Custom plywood casing box to neatly conceal pipes and trunking', duration: '90 mins', defaultPrice: 899, mcIcon: 'package-variant-closed' },
        { label: 'Custom Shoe Rack Fabrication', desc: 'Multi-shelf customized wooden shoe cabinet designed for entryway', duration: '1-2 Days', defaultPrice: 3499, mcIcon: 'shoe-formal' },
        { label: 'Wooden Window Mosquito Mesh Frame', desc: 'Solid wood outer frame with durable stainless steel wire mesh', duration: '60 mins', defaultPrice: 699, mcIcon: 'window-closed-variant' },
      ],
    },
  ],

  'Pest Control': [
    {
      name: 'Cockroach & Ant Herbal Gel Treatment',
      description: 'Odorless fipronil dot gel baiting and synthetic pyrethroid spray in cracks and crevices.',
      defaultPrice: 699,
      defaultEta: '45 mins',
      mcIcon: 'bug',
      variations: [
        { label: '1 BHK Odorless Gel Treatment', desc: 'Targeted cockroach gel dots in cabinets and kitchen plus ant baiting', duration: '35 mins', defaultPrice: 599, mcIcon: 'bug' },
        { label: '2 BHK Comprehensive Gel Treatment', desc: 'Kitchen, bathroom, drainage outlets, and pantry complete gel service', duration: '45 mins', defaultPrice: 799, mcIcon: 'home' },
        { label: '3 BHK Total Home Protection', desc: 'Full house gel treatment with residual spray for long-term protection', duration: '60 mins', defaultPrice: 999, mcIcon: 'home-variant' },
        { label: 'Commercial Kitchen / Restaurant Treatment', desc: 'Heavy infestation deep crack fumigation and food-safe gel baiting', duration: '90 mins', defaultPrice: 1599, mcIcon: 'food-fork-drink' },
        { label: 'Annual 3-Service Cockroach Protection', desc: 'Three scheduled treatments per year with 100% free re-treatment warranty', duration: '45 mins', defaultPrice: 1699, mcIcon: 'shield-check' },
      ],
    },
    {
      name: 'Bed Bug Thermal & Chemical Eradication',
      description: 'Dual-session contact spray, high-temperature steam extraction, and mattress treatment.',
      defaultPrice: 1199,
      defaultEta: '60 mins',
      mcIcon: 'bed',
      variations: [
        { label: 'Single Bedroom Intensive Treatment', desc: 'Mattress seams, headboard, baseboards, and frame contact spray', duration: '45 mins', defaultPrice: 999, mcIcon: 'bed-empty' },
        { label: '2 BHK Bed Bug Eradication Package', desc: 'Two treatment sessions (Day 1 and Day 14 egg hatching cycle)', duration: '90 mins', defaultPrice: 1799, mcIcon: 'home' },
        { label: '3 BHK Complete Home Eradication', desc: 'All bedrooms, sofa, and curtains full eradication with 60-day warranty', duration: '120 mins', defaultPrice: 2399, mcIcon: 'home-variant' },
        { label: 'Steam Treatment for Mattresses & Upholstery', desc: 'Chemical-free 180°C hot dry steam to instantly kill live bugs and eggs', duration: '60 mins', defaultPrice: 1299, mcIcon: 'radiator' },
        { label: 'Hostel / Shared Room Multi-Bed Protocol', desc: 'High-density bunk bed rapid knockdown and insect growth regulator spray', duration: '90 mins', defaultPrice: 1999, mcIcon: 'bunk-bed' },
      ],
    },
    {
      name: 'Termite Drilling & Chemical Barrier',
      description: 'Precision drill-fill-seal subterranean barrier using approved chlorpyrifos/imidacloprid termiticide.',
      defaultPrice: 2499,
      defaultEta: '120 mins',
      mcIcon: 'shield-bug',
      variations: [
        { label: 'Single Room / Door Frame Termite Treatment', desc: 'Precision 12mm drilling around infested woodwork and chemical injection', duration: '60 mins', defaultPrice: 1299, mcIcon: 'door' },
        { label: '1 BHK Perimeter Drill-Fill-Seal Barrier', desc: 'Drilling along wall-floor skirting perimeter and chemical pressure injection', duration: '120 mins', defaultPrice: 2799, mcIcon: 'home' },
        { label: '2 BHK Comprehensive Termite Warranty Plan', desc: 'Complete home anti-termite barrier with 1-year free inspection guarantee', duration: '180 mins', defaultPrice: 3999, mcIcon: 'home-variant' },
        { label: '3 BHK Total Termite Elimination Plan', desc: 'Whole-house wall perimeter, wooden fixtures, and false ceiling barrier', duration: '240 mins', defaultPrice: 5499, mcIcon: 'home-city' },
        { label: 'Pre-Construction Soil Foundation Treatment', desc: 'Sub-slab chemical trenching and foundation soil saturation', duration: '360 mins', defaultPrice: 8999, mcIcon: 'domain' },
      ],
    },
    {
      name: 'Rodent & Rat Proofing Control',
      description: 'Tamper-proof bait stations, glue traps, ultrasonic repellents, and pipe entry sealing.',
      defaultPrice: 599,
      defaultEta: '45 mins',
      mcIcon: 'rodent',
      variations: [
        { label: 'Home Rodent Baiting & Glue Board Setup', desc: 'Strategic placement of lockable bromadiolone bait stations and glue traps', duration: '30 mins', defaultPrice: 499, mcIcon: 'tray' },
        { label: 'Entry Point Wire Mesh Sealing', desc: 'Locate and seal AC pipe holes, drainage conduits, and gaps with wire mesh', duration: '60 mins', defaultPrice: 699, mcIcon: 'shield' },
        { label: 'Commercial Warehouse Rodent Elimination', desc: 'Multi-station perimeter bait defense and weekly carcass monitoring', duration: '90 mins', defaultPrice: 1499, mcIcon: 'warehouse' },
        { label: 'False Ceiling Ultrasonic Repeller Setup', desc: 'Install high-frequency sound repellent units inside false ceiling spaces', duration: '45 mins', defaultPrice: 899, mcIcon: 'access-point' },
        { label: 'Car Engine Bay Anti-Rat Protection Spray', desc: 'Bitterant anti-chew protective spray to stop rat damage to car wiring', duration: '30 mins', defaultPrice: 449, mcIcon: 'car' },
      ],
    },
    {
      name: 'Mosquito & Fly Cold Fogging',
      description: 'ULV cold aerosol fogging and larvicide breeding ground treatment for indoor and outdoor areas.',
      defaultPrice: 799,
      defaultEta: '45 mins',
      mcIcon: 'mosquito',
      variations: [
        { label: 'Indoor ULV Cold Aerosol Fogging', desc: 'Micro-droplet airborne knockdown fogging for living rooms and bedrooms', duration: '30 mins', defaultPrice: 599, mcIcon: 'weather-fog' },
        { label: 'Garden & Balcony Outdoor Thermal Fogging', desc: 'Dense smoke thermal fogging in bushes, drains, and open outdoor areas', duration: '45 mins', defaultPrice: 799, mcIcon: 'grass' },
        { label: 'Stagnant Water Larvicide Treatment', desc: 'Biological larvicide granules applied to drains, pots, and water sumps', duration: '30 mins', defaultPrice: 399, mcIcon: 'water' },
        { label: 'Apartment Complex Society Fogging', desc: 'Heavy vehicle-mounted thermal fogging for society compound and basements', duration: '90 mins', defaultPrice: 2499, mcIcon: 'office-building' },
        { label: 'Restaurant Dining Fly & Fruit Fly Control', desc: 'Fly glue trap installation and food-safe drain bactericide foam wash', duration: '45 mins', defaultPrice: 899, mcIcon: 'silverware' },
      ],
    },
  ],

  'Salon': [
    {
      name: 'Men Haircut & Beard Grooming',
      description: 'Precision scissor cut, fade haircut, beard shaping, hot towel shave, and scalp massage.',
      defaultPrice: 299,
      defaultEta: '40 mins',
      mcIcon: 'content-cut',
      variations: [
        { label: 'Classic Men Haircut & Styling', desc: 'Consultation, precision shear cut, neck trim, and matte wax styling', duration: '30 mins', defaultPrice: 249, mcIcon: 'content-cut' },
        { label: 'Beard Trimming & Razor Lineup', desc: 'Electric trimmer fading, cheek razor line shaping, and soothing balm', duration: '20 mins', defaultPrice: 149, mcIcon: 'mustache' },
        { label: 'Haircut + Beard Styling Combo', desc: 'Complete top cut, side taper, beard contouring, and hot towel wipe', duration: '45 mins', defaultPrice: 349, mcIcon: 'account' },
        { label: 'Hair Cut + Head Massage (15 Mins)', desc: 'Haircut followed by cooling ayurvedic oil scalp and shoulder massage', duration: '45 mins', defaultPrice: 399, mcIcon: 'head' },
        { label: 'Father & Son Haircut Package', desc: 'Two tailored haircuts and styling sessions in a single home visit', duration: '50 mins', defaultPrice: 449, mcIcon: 'account-multiple' },
      ],
    },
    {
      name: 'Women Haircut & Blowdry Styling',
      description: 'Layered cuts, bob/lob, split ends removal, Moroccan oil treatment, and bouncy blowouts.',
      defaultPrice: 499,
      defaultEta: '45 mins',
      mcIcon: 'hair-dryer',
      variations: [
        { label: 'Classic U/V Cut & Split Ends Trim', desc: 'Wash prep, precision length leveling, and quick blow-dry finish', duration: '30 mins', defaultPrice: 399, mcIcon: 'content-cut' },
        { label: 'Trendy Layered / Feather Haircut', desc: 'Volume-enhancing face-framing layers and Moroccan oil serum blowout', duration: '45 mins', defaultPrice: 599, mcIcon: 'content-cut' },
        { label: 'Bouncy Blowdry & Thermal Iron Styling', desc: 'Paddle brush blowout followed by sleek straight or beach wave iron styling', duration: '40 mins', defaultPrice: 449, mcIcon: 'hair-dryer' },
        { label: 'Deep Conditioning Hair Spa Ritual', desc: 'Keratin protein hair mask, steam infusion, and relaxing scalp acupressure', duration: '60 mins', defaultPrice: 899, mcIcon: 'spa' },
        { label: 'Olaplex Bond Repair Treatment', desc: 'Professional bond builder treatment to repair color-treated and heat-damaged hair', duration: '60 mins', defaultPrice: 1499, mcIcon: 'shimmer' },
      ],
    },
    {
      name: 'Facial, Cleanup & Skin Radiance',
      description: 'Gold facial, fruit peel cleanup, blackhead extraction, de-tan pack, and skin rejuvenation.',
      defaultPrice: 799,
      defaultEta: '60 mins',
      mcIcon: 'face-woman',
      variations: [
        { label: 'Quick Glow Express Cleanup', desc: 'Cleansing, gentle walnut scrub exfoliation, blackhead steam, and pack', duration: '35 mins', defaultPrice: 499, mcIcon: 'emoticon-outline' },
        { label: 'O3+ Bridal Radiance / Whitening Facial', desc: 'Multi-step skin brightening, serum infusion, and oxygen peel-off rubber mask', duration: '60 mins', defaultPrice: 1399, mcIcon: 'star-circle' },
        { label: '24K Gold Luxury Radiance Facial', desc: 'Gold leaf serum massage, lymphatic drain face roll, and radiant gold pack', duration: '60 mins', defaultPrice: 1199, mcIcon: 'crown' },
        { label: 'Anti-Acne Tea Tree Clarifying Facial', desc: 'Salicylic deep pore cleanse, high-frequency ozone therapy, and soothing gel', duration: '50 mins', defaultPrice: 899, mcIcon: 'leaf' },
        { label: 'Sun De-Tan Face & Neck Pack', desc: 'Kojic and milk protein instant sun damage removal and cool aloe vera massage', duration: '25 mins', defaultPrice: 349, mcIcon: 'weather-sunny' },
      ],
    },
    {
      name: 'Manicure & Pedicure Spa',
      description: 'Herbal foot soak, calloused heel buffing, nail cuticle trimming, scrub, and nail lacquer.',
      defaultPrice: 599,
      defaultEta: '60 mins',
      mcIcon: 'hand-wash',
      variations: [
        { label: 'Classic Pedicure Session', desc: 'Epsom salt soak, heel filing, cuticle trimming, and mint cream massage', duration: '40 mins', defaultPrice: 499, mcIcon: 'foot-print' },
        { label: 'Spa Manicure Session', desc: 'Hand soak, dead skin exfoliation, cuticle nourishing oil, and polish', duration: '35 mins', defaultPrice: 399, mcIcon: 'hand-back-left' },
        { label: 'Deluxe Mani-Pedi Combo Package', desc: 'Complete hands and feet deep soak, scrub, mask, and nail care package', duration: '75 mins', defaultPrice: 799, mcIcon: 'spa' },
        { label: 'Ice Cream / Chocolate Spa Pedicure', desc: 'Aromatherapy soak, rich chocolate mask, and hot paraffin wax foot wrap', duration: '60 mins', defaultPrice: 699, mcIcon: 'ice-cream' },
        { label: 'Long-Lasting Gel Nail Polish Application', desc: 'UV LED lamp cured chip-resistant gel color coat for fingernails or toes', duration: '45 mins', defaultPrice: 599, mcIcon: 'brush' },
      ],
    },
    {
      name: 'Waxing & Threading Services',
      description: 'Rica liposoluble wax, honey waxing, eyebrow shaping, upper lip, and full body hair removal.',
      defaultPrice: 699,
      defaultEta: '45 mins',
      mcIcon: 'feather',
      variations: [
        { label: 'Eyebrow & Upper Lip Threading', desc: 'Cotton thread precision arch shaping and aloe vera soothing gel', duration: '15 mins', defaultPrice: 99, mcIcon: 'eye' },
        { label: 'Full Arms + Full Legs Honey Waxing', desc: 'Warm honey wax application, muslin strip pull, and post-wax lotion', duration: '45 mins', defaultPrice: 599, mcIcon: 'feather' },
        { label: 'Full Body Premium Rica Waxing', desc: 'Gentle Italian liposoluble colophony-free wax for sensitive skin', duration: '90 mins', defaultPrice: 1699, mcIcon: 'human-female' },
        { label: 'Underarms & Bikini Line Rica Waxing', desc: 'Painless chocolate wax treatment with anti-ingrown hair serum', duration: '30 mins', defaultPrice: 449, mcIcon: 'shield-check' },
        { label: 'Full Back & Midriff Waxing', desc: 'Quick hygienic body waxing leaving skin soft and hair-free', duration: '35 mins', defaultPrice: 499, mcIcon: 'human' },
      ],
    },
  ],
};

export async function seedCatalog(disconnectOnComplete = true) {
  try {
    console.log('[SeedCatalog] Connecting to MongoDB at', MONGO_URI);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }

    console.log('[SeedCatalog] Fetching existing service categories...');
    const categories = await ServiceCategory.find();
    if (categories.length === 0) {
      console.warn('[SeedCatalog] No categories found! Make sure ServiceCategories are seeded first.');
      return;
    }

    const catMap = new Map<string, mongoose.Types.ObjectId>();
    categories.forEach((c) => {
      catMap.set(c.name, c._id as mongoose.Types.ObjectId);
    });

    let totalServicesUpserted = 0;
    let totalVariationsSeeded = 0;

    for (const [categoryName, services] of Object.entries(CATALOG_SEED_DATA)) {
      const categoryId = catMap.get(categoryName);
      if (!categoryId) {
        console.warn(`[SeedCatalog] Category "${categoryName}" not found in database. Skipping.`);
        continue;
      }

      for (const svc of services) {
        const doc = await ServiceCatalog.findOneAndUpdate(
          { categoryId, name: svc.name },
          {
            $set: {
              categoryLabel: categoryName,
              description: svc.description,
              defaultPrice: svc.defaultPrice,
              defaultEta: svc.defaultEta,
              mcIcon: svc.mcIcon,
              variations: svc.variations,
              isActive: true,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (doc) {
          totalServicesUpserted++;
          totalVariationsSeeded += (doc.variations || []).length;
        }
      }
    }

    console.log(
      `[SeedCatalog] Successfully processed catalog! Total Services: ${totalServicesUpserted}, Total Variations: ${totalVariationsSeeded}`
    );
  } catch (err) {
    console.error('[SeedCatalog] Error seeding catalog:', err);
    throw err;
  } finally {
    if (disconnectOnComplete && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[SeedCatalog] Disconnected from MongoDB.');
    }
  }
}

// Direct execution from CLI
if (require.main === module) {
  seedCatalog(true)
    .then(() => {
      console.log('[SeedCatalog] CLI execution completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SeedCatalog] CLI execution failed:', err);
      process.exit(1);
    });
}
