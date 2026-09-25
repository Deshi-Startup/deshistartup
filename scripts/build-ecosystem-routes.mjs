#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { ideaSlug } from '../app/lib/idea-routes.mjs'
import { parseCsv } from './csv.mjs'
import { snapshotDigest, validateEcosystemSnapshot } from './lib/ecosystem-snapshot.mjs'

const root = path.resolve(import.meta.dirname, '..')
const read = p => fs.readFileSync(path.join(root, p), 'utf8')
const data = validateEcosystemSnapshot(JSON.parse(read('data/ecosystem/public.json')))
const marker = JSON.parse(read('public/ecosystem-release.json'))
if (marker.releaseId !== data.releaseId || marker.digest !== snapshotDigest(data)) throw new Error('Public snapshot was edited outside the release exporter. Prepare it from D1.')
// Keep the API aligned with the shipped catalogue without bundling full briefs.
const voteIdsPath = path.join(root, 'app/generated/idea-ids.json')
const voteIds = JSON.stringify(data.approaches.map(idea => idea.id)) + '\n'
if (!fs.existsSync(voteIdsPath) || fs.readFileSync(voteIdsPath, 'utf8') !== voteIds) fs.writeFileSync(voteIdsPath, voteIds)
const profileDescription = text => text.length > 250 ? text.split(/(?<=[.!?।])\s+/)[0] : text
// Search metadata is separate from the short, reader-facing idea titles.
// Keep the business-idea intent clear: these pages do not sell the services.
const ideaSearchCopy = {
  'modular-data-centers': {
    en: ['App Backup Service: A Startup Idea for Bangladesh', 'Help software companies restart an app when its main server fails. Start with rented space and test the backup before building a new data center.'],
    bn: ['সার্ভার বন্ধ হলে অ্যাপ ফের চালুর সেবা: ব্যবসার আইডিয়া', 'মূল সার্ভার বন্ধ হলে অ্যাপ অন্য জায়গায় চালুর ব্যবস্থা করুন। আগে ভাড়া করা জায়গায় পরীক্ষা করুন, তারপর নতুন কেন্দ্রের কথা ভাবুন।']
  },
  'solar-inverter-repair': {
    en: ['Solar Inverter Repair: A Startup Idea for Bangladesh', 'Help rooftop solar installers find inverter faults and arrange safe repairs. Test whether they will pay for outside help.'],
    bn: ['সোলার ইনভার্টার মেরামত: বাংলাদেশে ব্যবসার আইডিয়া', 'ইনস্টলারকে ছাদের সোলার ইনভার্টারের সমস্যা খুঁজতে সাহায্য করুন। কাজের ফি পাওয়া যায় কি না, পরীক্ষা করুন।']
  },
  'garment-offcuts-approach': {
    en: ['Garment Waste Recycling: A Startup Idea for Bangladesh', 'Explore a garment waste recycling business idea in Bangladesh. Connect factories with recyclers, plan how to earn, and test one small batch.'],
    bn: ['ঝুট কাপড় রিসাইক্লিং: বাংলাদেশে ব্যবসার আইডিয়া', 'কারখানার ঝুট কাপড় রিসাইক্লিং মিলে বিক্রির ব্যবসার আইডিয়া দেখুন। কাদের সঙ্গে কাজ করবেন, আয় কীভাবে হবে আর ছোট করে কীভাবে পরীক্ষা করবেন, জানুন।']
  },
  'harvest-cooling': {
    en: ['Cold Storage Rental: A Startup Idea for Bangladesh', 'Explore a cold storage rental business idea for farmers in Bangladesh. See who could pay, what to check, and how to test storage by the crate.'],
    bn: ['ফসলের জন্য হিমাগার ভাড়া: বাংলাদেশে ব্যবসার আইডিয়া', 'কৃষকদের ক্রেট হিসেবে হিমাগারের জায়গা ভাড়া দেওয়ার ব্যবসার আইডিয়া দেখুন। কারা টাকা দেবেন আর ছোট করে কীভাবে পরীক্ষা করবেন, জেনে নিন।']
  },
  'reliable-water': {
    en: ['Water Filter Maintenance: A Startup Idea for Bangladesh', 'Explore a water filter maintenance business idea for schools and clinics in Bangladesh. Plan regular checks, repairs, pricing, and a small first test.'],
    bn: ['পানির ফিল্টার মেরামত: বাংলাদেশে ব্যবসার আইডিয়া', 'স্কুল ও ক্লিনিকের পানির ফিল্টার পরীক্ষা ও মেরামতের ব্যবসার আইডিয়া দেখুন। নিয়মিত সার্ভিস, আয়ের উপায় আর শুরুতে কী পরীক্ষা করবেন, জানুন।']
  },
  'clinic-follow-up': {
    en: ['Patient Follow-Up Software: A Startup Idea for Bangladesh', 'Explore a patient follow-up software idea for small clinics in Bangladesh. Help staff arrange missed visits and test the idea before building an app.'],
    bn: ['ক্লিনিকের ফলোআপ সফটওয়্যার: স্টার্টআপ আইডিয়া', 'ছোট ক্লিনিকে রোগীদের ফলোআপে ডাকার সফটওয়্যার আইডিয়া দেখুন। অ্যাপ বানানোর আগে ক্লিনিকের কর্মীদের সঙ্গে কীভাবে পরীক্ষা করবেন, জেনে নিন।']
  },
  'cooler-workplaces': {
    en: ['Factory Cooling Services: A Startup Idea for Bangladesh', 'Explore a factory cooling business idea in Bangladesh. See who could pay for heat-reducing changes and how to test a small area before taking on more work.'],
    bn: ['কারখানার গরম কমানোর সার্ভিস: ব্যবসার আইডিয়া', 'বাংলাদেশে কারখানার গরম কমানোর ব্যবসার আইডিয়া দেখুন। কারা এই কাজের খরচ দেবেন আর ছোট একটি জায়গায় কীভাবে পরীক্ষা করবেন, জেনে নিন।']
  },
  'solar-upkeep': {
    en: ['Solar Panel Cleaning: A Startup Idea for Bangladesh', 'Explore a solar panel cleaning and maintenance business idea in Bangladesh. See who could pay, what trained technicians do, and how to test the service.'],
    bn: ['সোলার প্যানেল পরিষ্কার: বাংলাদেশে ব্যবসার আইডিয়া', 'ছাদের সোলার প্যানেল পরিষ্কার ও মেরামতের ব্যবসার আইডিয়া দেখুন। কাদের সার্ভিস দেবেন, আয় কীভাবে হবে আর ছোট করে কীভাবে পরীক্ষা করবেন, জানুন।']
  },
  'supplier-evidence': {
    en: ["Garment Supplier Records: A Software Startup Idea", "Explore a startup idea for garment factories in Bangladesh: match supplier records to buyer requests, find missing documents, and test a paid service."],
    bn: ["গার্মেন্টসের সাপ্লায়ার রেকর্ড গুছানো: স্টার্টআপ আইডিয়া", "বায়ারের চাহিদামতো গার্মেন্টসের কাগজপত্র গুছিয়ে দেওয়ার ব্যবসার আইডিয়া দেখুন। কী তথ্য নেই, তা খুঁজে দিয়ে ছোট করে পেইড সার্ভিস পরীক্ষা করুন।"]
  },
  'compressed-air': {
    en: ["Compressed Air Leak Detection: A Business Idea", "Explore a factory air-leak detection business in Bangladesh. Work with trained technicians, test one factory, and plan repeat checks and repair fees."],
    bn: ["কারখানার কমপ্রেসড এয়ার লিক খোঁজা: ব্যবসার আইডিয়া", "কারখানার বাতাসের লাইনে লিক খোঁজা ও মেরামতের ব্যবসার আইডিয়া দেখুন। দক্ষ টেকনিশিয়ান নিয়ে একটি কারখানায় কাজ পরীক্ষা করুন, খরচ আর ফি মিলিয়ে নিন।"]
  },
  'etp-operations': {
    en: ["Factory ETP Maintenance: A Business Idea", "Explore a service for factory wastewater treatment plants in Bangladesh. See who could pay for maintenance, lab tests, and support for plant operators."],
    bn: ["কারখানার ETP দেখভাল: বাংলাদেশে ব্যবসার আইডিয়া", "কারখানার বর্জ্যপানি শোধনের প্ল্যান্ট দেখভালের ব্যবসার আইডিয়া দেখুন। মেরামত, ল্যাব টেস্ট আর অপারেটরকে সহায়তার জন্য কারা টাকা দেবেন, বুঝে নিন।"]
  },
  'verified-spares': {
    en: ["Factory Spare Parts Supply: A Business Idea", "Explore a startup idea for locally made factory spare parts. Start with one safe, repeat part, check its quality, and test paid orders before expanding."],
    bn: ["কারখানার স্পেয়ার পার্টস সরবরাহ: ব্যবসার আইডিয়া", "স্থানীয় ওয়ার্কশপে কারখানার পার্টস বানিয়ে দেওয়ার ব্যবসার আইডিয়া দেখুন। নিরাপত্তার ঝুঁকি কম এমন একটি পার্টস দিয়ে শুরু করে মান আর পেইড অর্ডার যাচাই করুন।"]
  },
  'food-sample-runs': {
    en: ["Food Lab Sample Collection: A Business Idea", "Explore a food-testing support business in Bangladesh. Collect samples for suitable labs, track each handover, and test a route with paying customers."],
    bn: ["খাবারের নমুনা ল্যাবে পৌঁছানো: ব্যবসার আইডিয়া", "খাদ্য ব্যবসার নমুনা উপযুক্ত ল্যাবে পৌঁছে দেওয়ার ব্যবসার আইডিয়া দেখুন। প্রতিবার কার হাতে নমুনা গেল, তা লিখে রাখুন আর একটি রুটে টাকা নিয়ে কাজটি পরীক্ষা করুন।"]
  },
  'export-document-check': {
    en: ["Export Document Checking: A Startup Idea", "Explore an export paperwork checking service in Bangladesh. Find mismatched shipment details, plan a fee, and test the work before building software."],
    bn: ["রপ্তানির কাগজপত্র যাচাই: স্টার্টআপ আইডিয়া", "রপ্তানির চালানে তথ্যের গরমিল খুঁজে দেওয়ার ব্যবসার আইডিয়া দেখুন। সফটওয়্যার বানানোর আগে একজন অভিজ্ঞ লোক নিয়ে কাজ আর ফি পরীক্ষা করুন।"]
  },
  'aquaculture-diagnostics': {
    en: ["Fish Disease Testing Support: A Business Idea", "Explore a sample collection service for fish farms in Bangladesh. Work with a suitable lab and fish-health specialist, and test one paid collection route."],
    bn: ["মাছের রোগ পরীক্ষায় সহায়তা: ব্যবসার আইডিয়া", "মাছের খামারের নমুনা ল্যাবে নেওয়ার ব্যবসার আইডিয়া দেখুন। বিশেষজ্ঞ ও উপযুক্ত ল্যাবের সঙ্গে কাজ করে একটি রুটে টাকা নিয়ে নমুনা সংগ্রহের কাজ পরীক্ষা করুন।"]
  },
  'recycled-resin-quality': {
    en: ["Recycled Plastic Supply: A Business Idea", "Explore a recycled plastic supply business in Bangladesh. Match batches to a buyer's needs, check quality, and test orders before investing in a plant."],
    bn: ["রিসাইকেল করা প্লাস্টিক সরবরাহ: ব্যবসার আইডিয়া", "বায়ারের চাহিদামতো রিসাইকেল করা প্লাস্টিক সরবরাহের ব্যবসার আইডিয়া দেখুন। নিজের প্ল্যান্ট করার আগে ব্যাচের মান আর পেইড অর্ডার পরীক্ষা করুন।"]
  },
  'bangla-order-intake': {
    en: ["Bangla Voice Order Software: A Startup Idea", "Explore software that turns Bangla dealer messages into draft orders. See how staff can check the details and how to test the idea with a distributor."],
    bn: ["বাংলা ভয়েস মেসেজ থেকে অর্ডার: সফটওয়্যার আইডিয়া", "ডিলারের বাংলা মেসেজ থেকে খসড়া অর্ডার তৈরির সফটওয়্যার আইডিয়া দেখুন। কর্মীরা তথ্য মিলিয়ে নেবেন। একজন ডিস্ট্রিবিউটরের সঙ্গে পরীক্ষা করে শুরু করুন।"]
  },
  'chip-verification': {
    en: ["Chip Design Verification: A Startup Idea", "Explore a chip design testing business based in Bangladesh. Start with an experienced team, one test plan, and a small paid project for a chip company."],
    bn: ["চিপের ডিজাইন পরীক্ষা: বাংলাদেশে স্টার্টআপ আইডিয়া", "বাংলাদেশ থেকে চিপের ডিজাইন পরীক্ষার ব্যবসার আইডিয়া দেখুন। অভিজ্ঞ টিম, পরিষ্কার টেস্ট প্ল্যান আর একটি ছোট পেইড প্রজেক্ট দিয়ে শুরু করার উপায় জানুন।"]
  },
  'technician-proof-of-skill': {
    en: ["Technician Skills Testing: A Business Idea", "Explore a technician hiring and skills-testing business in Bangladesh. Match practical tests to real jobs, work with trained assessors, and test employer demand."],
    bn: ["টেকনিশিয়ানের কাজের দক্ষতা পরীক্ষা: ব্যবসার আইডিয়া", "হাতে-কলমে পরীক্ষা নিয়ে টেকনিশিয়ান নিয়োগে সাহায্যের ব্যবসার আইডিয়া দেখুন। আসল চাকরির কাজের সঙ্গে পরীক্ষা মিলিয়ে নিয়োগদাতার চাহিদা যাচাই করুন।"]
  },
  'shared-childcare': {
    en: ["Shared Workplace Daycare: A Business Idea", "Explore shared daycare for nearby employers in Bangladesh. Work with an existing centre, check child safety, and test whether employers will reserve places."],
    bn: ["কয়েকটি অফিসের জন্য শেয়ার করা ডে-কেয়ার: ব্যবসার আইডিয়া", "কাছের অফিসগুলোর জন্য ডে-কেয়ারের ব্যবস্থা করার ব্যবসার আইডিয়া দেখুন। চালু কেন্দ্রের সঙ্গে কাজ করে শিশুর নিরাপত্তা আর অফিসের পেইড চাহিদা যাচাই করুন।"]
  },
  'bangla-speech-infrastructure': {
    en: ["Bangla Speech-to-Text Software: A Startup Idea", "Explore a Bangla speech-to-text startup for local calls and accents. Test real recordings with permission, check errors, and plan how to charge software teams."],
    bn: ["বাংলা কথা লেখায় আনার সফটওয়্যার: স্টার্টআপ আইডিয়া", "বাংলাদেশের উচ্চারণ বোঝে এমন স্পিচ-টু-টেক্সট সফটওয়্যার আইডিয়া দেখুন। অনুমতি নিয়ে কলের রেকর্ড পরীক্ষা করুন, ভুল খুঁজুন আর আয়ের উপায় ঠিক করুন।"]
  },
  'code-change-verification': {
    en: ["AI Code Testing: A Startup Idea", "Explore a software testing startup based in Bangladesh. Check whether AI-written changes fix a bug, catch new failures, and test a service developers will pay for."],
    bn: ["এআইয়ের লেখা কোড পরীক্ষা: সফটওয়্যার স্টার্টআপ আইডিয়া", "এআইয়ের লেখা কোডে বাগ ঠিক হয়েছে কি না, তা পরীক্ষার স্টার্টআপ আইডিয়া দেখুন। নতুন ভুল ধরুন আর ডেভেলপাররা এই সার্ভিসের জন্য টাকা দেবেন কি না যাচাই করুন।"]
  },
  'merchant-settlement-reconciliation': {
    en: ["Payment Reconciliation Software: A Startup Idea", "Explore software that matches sales to bank, wallet, and courier payments in Bangladesh. Help sellers spot missing money and test a monthly service."],
    bn: ["বিক্রির সঙ্গে পেমেন্ট মেলানোর সফটওয়্যার: স্টার্টআপ আইডিয়া", "ব্যাংক, ওয়ালেট আর কুরিয়ারের টাকার সঙ্গে বিক্রির হিসাব মেলানোর সফটওয়্যার আইডিয়া দেখুন। বাকি টাকা খুঁজে দেওয়ার মাসিক সার্ভিস পরীক্ষা করুন।"]
  },
  'bank-cross-border-connectors': {
    en: ["Bank Payment Integration Software: A Startup Idea", "Explore software for banks and approved overseas payment partners. Match records and flag gaps while the bank keeps control of approvals and money movement."],
    bn: ["ব্যাংকের বিদেশি পেমেন্ট সংযোগ: সফটওয়্যার আইডিয়া", "ব্যাংক আর অনুমোদিত বিদেশি পেমেন্ট পার্টনারের হিসাব মেলানোর সফটওয়্যার আইডিয়া দেখুন। অনুমোদন আর টাকা পাঠানোর নিয়ন্ত্রণ ব্যাংকের হাতেই থাকবে।"]
  },
  'invoice-finance-evidence': {
    en: ["Invoice Finance Checks: A Software Startup Idea", "Explore software that helps lenders check export invoices, shipping proof, and payments. Test with a licensed lender that keeps control of credit decisions."],
    bn: ["ঋণদাতার জন্য রপ্তানির ইনভয়েস যাচাই: সফটওয়্যার আইডিয়া", "ইনভয়েস, মাল পাঠানোর প্রমাণ আর পেমেন্ট যাচাইয়ে ঋণদাতাকে সাহায্যের সফটওয়্যার আইডিয়া দেখুন। ঋণ দেওয়ার সিদ্ধান্ত লাইসেন্সধারী ঋণদাতাই নেবেন।"]
  },
  'adaptive-bangla-learning': {
    en: ["Bangla Maths Learning App: A Startup Idea", "Explore a Bangla maths learning app for children in Bangladesh. Give practice at the right level, support teachers, and test learning gains in a school pilot."],
    bn: ["বাংলায় অঙ্ক শেখার অ্যাপ: স্টার্টআপ আইডিয়া", "শিশুর শেখার লেভেল অনুযায়ী বাংলায় অঙ্ক অনুশীলনের অ্যাপ আইডিয়া দেখুন। শিক্ষককে সঙ্গে রেখে স্কুলে পরীক্ষা করুন, শেখায় কতটা সাহায্য হচ্ছে মিলিয়ে নিন।"]
  },
  'bangla-assessment-feedback': {
    en: ["Bangla Classwork Feedback: An Edtech Startup Idea", "Explore software that turns photos of Bangla classwork into draft feedback. Teachers check every suggestion. Test accuracy and time saved before expanding."],
    bn: ["বাংলা ক্লাসওয়ার্কে ফিডব্যাক: এডটেক স্টার্টআপ আইডিয়া", "খাতার ছবি থেকে খসড়া ফিডব্যাক দেওয়ার সফটওয়্যার আইডিয়া দেখুন। শিক্ষক প্রতিটি পরামর্শ মিলিয়ে নেবেন। আগে ভুলের হার আর সময় বাঁচছে কি না পরীক্ষা করুন।"]
  },
  'fish-farm-autopilot': {
    en: ["Fish Farm Water Monitoring: A Startup Idea", "Explore a fish-farm monitoring business in Bangladesh. Test water sensors and useful alerts with a farm specialist before adding equipment controls."],
    bn: ["মাছের খামারের পানি নজরে রাখা: স্টার্টআপ আইডিয়া", "মাছের খামারে পানির অবস্থা আর সতর্কতা জানানোর ব্যবসার আইডিয়া দেখুন। যন্ত্রের নিয়ন্ত্রণ যোগ করার আগে বিশেষজ্ঞ নিয়ে সেন্সর ও সতর্কতা পরীক্ষা করুন।"]
  },
  'crop-loss-data': {
    en: ["Crop Damage Data for Insurers: A Startup Idea", "Explore a crop-damage data startup in Bangladesh. Compare satellite images with field checks and help licensed insurers review affected farms."],
    bn: ["বীমার জন্য ফসলের ক্ষতির তথ্য: স্টার্টআপ আইডিয়া", "বীমা কোম্পানিকে ফসলের ক্ষতি যাচাইয়ে সাহায্যের স্টার্টআপ আইডিয়া দেখুন। স্যাটেলাইটের ছবি মাঠের তথ্যের সঙ্গে মিলিয়ে দিন, সিদ্ধান্ত কোম্পানিই নেবে।"]
  },
  'direct-export-operations': {
    en: ["Export Order Fulfilment: A Business Idea", "Explore a service that helps Bangladeshi brands deliver overseas orders. Check shipping, payment, and return rules, then test one product and destination."],
    bn: ["দেশি ব্র্যান্ডের বিদেশি অর্ডার পৌঁছানো: ব্যবসার আইডিয়া", "দেশি ব্র্যান্ডের বিদেশি অর্ডার সামলানোর ব্যবসার আইডিয়া দেখুন। পণ্য পাঠানো, টাকা পাওয়া আর রিটার্নের নিয়ম মিলিয়ে একটি পণ্য ও দেশ দিয়ে পরীক্ষা করুন।"]
  },
  'forwarder-shipment-control': {
    en: ["Freight Forwarding Software: A Startup Idea", "Explore software for freight-forwarding teams in Bangladesh. Keep shipment documents, deadlines, and customer updates together, and test one repeat workflow."],
    bn: ["ফ্রেইট ফরওয়ার্ডিং সফটওয়্যার: স্টার্টআপ আইডিয়া", "ফ্রেইট টিমের চালান, কাগজপত্র, শেষ সময় আর কাস্টমার আপডেট একসঙ্গে রাখার সফটওয়্যার আইডিয়া দেখুন। নিয়মিত হয় এমন একটি কাজ দিয়ে পরীক্ষা করুন।"]
  },
  'shared-parcel-returns': {
    en: ["Parcel Pickup and Returns: A Startup Idea", "Explore shared parcel pickup and return points at local shops in Bangladesh. Test a courier route, track handovers, and plan fees with shops and merchants."],
    bn: ["দোকানে পার্সেল নেওয়া ও রিটার্ন: স্টার্টআপ আইডিয়া", "কাছের দোকানে পার্সেল নেওয়া ও ফেরত দেওয়ার ব্যবসার আইডিয়া দেখুন। একটি কুরিয়ার রুটে পরীক্ষা করুন আর দোকান ও বিক্রেতার সঙ্গে ফি ঠিক করুন।"]
  },
  'pooled-employee-transport': {
    en: ["Shared Employee Transport: A Business Idea", "Explore shared staff transport for nearby employers in Bangladesh. Test one route, agree pickup times and backup vehicles, and check costs per reserved seat."],
    bn: ["অফিসে একসঙ্গে যাতায়াতের সার্ভিস: ব্যবসার আইডিয়া", "কাছের অফিসগুলোর কর্মীদের একসঙ্গে যাতায়াতের ব্যবসার আইডিয়া দেখুন। একটি রুটে সময়, বিকল্প গাড়ি আর বুক করা সিটের খরচ মিলিয়ে পরীক্ষা করুন।"]
  },
  'tour-operator-software': {
    en: ["Tour Operator Booking Software: A Startup Idea", "Explore booking software for tour operators in Bangladesh. Keep seats, rooms, guides, and payments in step, then test one trip format with a paying operator."],
    bn: ["ট্যুর অপারেটরের বুকিং সফটওয়্যার: স্টার্টআপ আইডিয়া", "ট্যুরের সিট, রুম, গাইড আর পেমেন্টের হিসাব একসঙ্গে রাখার সফটওয়্যার আইডিয়া দেখুন। টাকা দিতে রাজি এমন একজন অপারেটরের সঙ্গে এক ধরনের ট্রিপে পরীক্ষা করুন।"]
  },
  'solar-irrigation-control': {
    en: ["Solar Irrigation Software: A Startup Idea", "Explore software for solar irrigation operators in Bangladesh. Plan pump schedules, record water requests and payments, and test the service at one pump."],
    bn: ["সোলার সেচের সফটওয়্যার: স্টার্টআপ আইডিয়া", "সোলার সেচের সময়, পানির অনুরোধ আর পেমেন্ট গুছিয়ে রাখার সফটওয়্যার আইডিয়া দেখুন। একটি পাম্পে অপারেটর ও কৃষকদের সঙ্গে সার্ভিস পরীক্ষা করুন।"]
  },
  'fleet-depot-electrification': {
    en: ["EV Fleet and Depot Charging: A Business Idea", "Explore a business helping fleets use electric vehicles in Bangladesh. Test one regular route with charging, maintenance, and backup plans before expanding."],
    bn: ["বৈদ্যুতিক গাড়ি আর গ্যারেজে চার্জিং: ব্যবসার আইডিয়া", "নিয়মিত রুটে বৈদ্যুতিক গাড়ি চালাতে সাহায্যের ব্যবসার আইডিয়া দেখুন। একটি গাড়ি দিয়ে চার্জিং, মেরামত আর বিকল্প গাড়ির ব্যবস্থা পরীক্ষা করুন।"]
  },
  'distributed-energy-orchestration': {
    en: ["Solar and Battery Management: A Startup Idea", "Explore software that helps buildings use solar power and batteries in Bangladesh. Test a schedule at one site and measure savings after service costs."],
    bn: ["সোলার আর ব্যাটারি চালানোর সফটওয়্যার: স্টার্টআপ আইডিয়া", "ভবনে সোলার ও ব্যাটারি একসঙ্গে চালানোর সফটওয়্যার আইডিয়া দেখুন। একটি জায়গায় সময়সূচি পরীক্ষা করুন, সার্ভিসের খরচ বাদ দিয়ে সাশ্রয় হিসাব করুন।"]
  },
  'underwater-inspection-robotics': {
    en: ["Underwater Robot Inspections: A Business Idea", "Explore an underwater inspection business in Bangladesh. Work with a survey team and robot supplier, test one civilian job, and check that the report is useful."],
    bn: ["রোবট দিয়ে পানির নিচে পরীক্ষা: ব্যবসার আইডিয়া", "পানির নিচের কাঠামো রোবট দিয়ে পরীক্ষার ব্যবসার আইডিয়া দেখুন। জরিপ টিম ও রোবট সরবরাহকারীর সঙ্গে একটি বেসামরিক কাজে পরীক্ষা করে রিপোর্টের উপযোগিতা দেখুন।"]
  },
  'shared-farm-robotics': {
    en: ["Farm Robot Services: A Startup Idea", "Explore a shared farm-robot service in Bangladesh. Start with one crop and task, arrange trained operators, and test whether fees cover the full season's costs."],
    bn: ["খামারে রোবট দিয়ে কাজ করানোর সার্ভিস: স্টার্টআপ আইডিয়া", "কয়েকটি খামারে রোবট দিয়ে কাজ করে দেওয়ার ব্যবসার আইডিয়া দেখুন। একটি ফসল ও কাজ বেছে দক্ষ অপারেটর নিন, পুরো মৌসুমের খরচের সঙ্গে ফি মিলিয়ে নিন।"]
  }
}
// These profile snippets describe the published record without turning the
// company directory into a second case-study or investor-comparison page.
const companySearchDescriptions = {
  barikoi: {
    en: 'Barikoi makes maps and location tools for Bangladesh. Explore what the company offers and check the sources behind its profile.',
    bn: 'Barikoi বাংলাদেশের জন্য ম্যাপ ও লোকেশন টুল বানায়। কোম্পানিটির কাজ আর তথ্যের সোর্স দেখে নিন।'
  },
  ostad: {
    bn: 'Ostad লাইভ ক্লাসে পেশাগত ও প্রযুক্তিগত দক্ষতা শেখায়। কোম্পানিটির কাজ আর তথ্যের সোর্স দেখে নিন।'
  },
  tallykhata: {
    bn: 'TallyKhata ছোট দোকানদারদের হিসাব, পেমেন্ট ও আর্থিক কাজের টুল দেয়। কোম্পানিটির কাজ আর তথ্যের সোর্স দেখে নিন।'
  },
  'bangladesh-women-investors-network': {
    en: 'Bangladesh Women Investors Network brings women angel investors together and works to improve funding and mentoring for women-led startups.'
  },
  'bangladesh-startup-investment-company-plc-bsic': {
    en: 'Backed by 39 Bangladeshi banks, BSIC has an ONKUR fund designed to co-invest in local startups alongside a lead investor.'
  },
  'idlc-venture-capital': {
    bn: 'IDLC Venture Capital বাংলাদেশে প্রযুক্তিনির্ভর স্টার্টআপে বিনিয়োগ করে। এখন আবেদন নেওয়া হচ্ছে না। ২০২৭ সালে নতুন ফান্ড চালুর পরিকল্পনা আছে, তবে আবেদন খোলেনি।'
  }
}
const routes = [
  { route: 'startup-ideas', component: 'Ideas', seo: { en: 'Startup and New Business Ideas in Bangladesh', bn: 'বাংলাদেশে স্টার্টআপ ও নতুন ব্যবসার আইডিয়া' }, en: ['Startup ideas for Bangladesh', 'Explore startup and new business ideas for Bangladesh. See who each idea helps, ways to earn, and a small test to try before you build.'], bn: ['বাংলাদেশের জন্য স্টার্টআপ আইডিয়া', 'বাংলাদেশের জন্য স্টার্টআপ আইডিয়া খুঁজে নিন। কাদের কাজে লাগবে, আয়ের উপায় কী আর ছোট করে কীভাবে পরীক্ষা করবেন, জেনে নিন।'] },
  { route: 'companies', component: 'Companies', seo: { en: 'Startup Companies and Investors in Bangladesh', bn: 'বাংলাদেশের স্টার্টআপ কোম্পানি ও বিনিয়োগকারী' }, en: ['Companies in Bangladesh’s startup ecosystem', 'Explore companies and investors in Bangladesh. Discover products, people, funding context, case studies and research sources.'], bn: ['বাংলাদেশের স্টার্টআপ ও বিনিয়োগকারী', 'বাংলাদেশের কোম্পানি ও বিনিয়োগকারীদের কাজ, প্রোডাক্ট, মানুষ, অর্থায়ন ও কেস স্টাডি সম্পর্কে জানুন।'] },
  { route: 'startup-ideas/add-company', component: 'ContributeConnection', en: ['Add a company working on a problem', 'Choose an existing company or suggest a new one. Add its work and a public source for review.'], bn: ['সমস্যা নিয়ে কাজ করা কোম্পানির তথ্য দিন', 'কোম্পানি বেছে নিন বা নতুন তথ্য দিন। প্রকাশের আগে যাচাই করা হবে।'] },
  { route: 'startup-ideas/review', component: 'ConnectionReview', en: ['Review submissions', 'Private review queue for Deshi Startup reviewers.'], bn: ['জমা দেওয়া তথ্য পর্যালোচনা', 'Deshi Startup-এর পর্যালোচকদের জন্য জমা দেওয়া তথ্য।'] },
  { route: 'startup-ideas/submissions', component: 'IdeaSubmissions', en: ['Your submitted ideas', 'View your private idea submissions and reviewer feedback.'], bn: ['আপনার জমা দেওয়া আইডিয়া', 'জমা দেওয়া আইডিয়ার অবস্থা ও পর্যালোচকের মন্তব্য দেখুন।'] },
  { route: 'startup-ideas/add', component: 'ContributeIdea', en: ['Add a startup idea', 'Share a startup idea for Bangladesh. Describe what you would build and who it would help.'], bn: ['স্টার্টআপ আইডিয়া দিন', 'বাংলাদেশের জন্য আপনার স্টার্টআপ আইডিয়া জানান। কী বানাতে চান আর কাদের কাজে লাগবে, লিখুন।'] },
  ...data.approaches.map(p => ({ route: `startup-ideas/${ideaSlug(p.id)}`, id: p.id, component: 'IdeaDetail', seo: { en: ideaSearchCopy[p.id]?.en[0], bn: ideaSearchCopy[p.id]?.bn[0] }, en: [p.en.title, ideaSearchCopy[p.id]?.en[1] || p.en.summary], bn: [p.bn.title, ideaSearchCopy[p.id]?.bn[1] || p.bn.summary] })),
  ...data.organizations.map(o => ({ route: `companies/${o.slug}`, id: o.id, component: 'CompanyProfile', en: [`${o.en.name} company profile`, companySearchDescriptions[o.slug]?.en || profileDescription(o.en.description)], bn: [`${o.bn.name} সম্পর্কে`, companySearchDescriptions[o.slug]?.bn || profileDescription(o.bn.description)] }))
]
if (new Set(routes.map(r => r.route)).size !== routes.length) throw new Error('Duplicate ecosystem route')
const generatedMark = '{/* Generated from the approved ecosystem snapshot by scripts/build-ecosystem-routes.mjs. */}'
for (const locale of ['en', 'bn']) {
  const content = path.join(root, 'app/(contents)', locale === 'en' ? 'en' : '(bn)')
  for (const r of routes) {
    const file = path.join(content, r.route, 'page.mdx')
    const relative = r.route.includes('/') ? '../../../../' : '../../../'
    const body = `---\ntitle: ${JSON.stringify(r[locale][0])}\n${r.seo?.[locale] ? `seoTitle: ${JSON.stringify(r.seo[locale])}\n` : ''}description: ${JSON.stringify(r[locale][1])}\n---\n\n${generatedMark}\n\nimport ${r.component} from '${relative}components/ideas/${r.component}'\n\n<${r.component} locale="${locale}"${r.id ? ` id="${r.id}"` : ''} />\n`
    fs.mkdirSync(path.dirname(file), { recursive: true })
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) fs.writeFileSync(file, body)
  }
  // Retire only generated wrappers. Authored content is never removed.
  for (const family of ['problems', 'startup-ideas', 'companies']) {
    const directory = path.join(content, family)
    if (!fs.existsSync(directory)) continue
    const candidates = [family, ...fs.readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => `${family}/${entry.name}`)]
    for (const route of candidates) {
      if (routes.some(r => r.route === route)) continue
      const file = path.join(content, route, 'page.mdx')
      if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(generatedMark)) fs.unlinkSync(file)
      const folder = path.dirname(file)
      if (fs.readdirSync(folder).length === 0) fs.rmdirSync(folder)
    }
    if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory)
  }
}
// Reviewed slugs become permanent routes; the public registry retains older entries.
const backlogPath = path.join(root, 'plan/content-backlog.csv')
const backlog = fs.readFileSync(backlogPath, 'utf8')
const registered = new Set(parseCsv(backlog).slice(1).map(row => row[4]))
const csv = value => /[,"\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
const added = routes.filter(r => !registered.has(`/${r.route}`)).map(r => ['Resources', 'Startup ideas', r.bn[0], r.en[0], `/${r.route}`, 'Tool', 'Medium', 'Reviewed ecosystem record; static public snapshot.'].map(csv).join(','))
if (added.length) fs.writeFileSync(backlogPath, backlog.trimEnd() + '\n' + added.join('\n') + '\n')
console.log(`Ecosystem: ${routes.length * 2} bilingual routes from ${data.releaseId}.`)
