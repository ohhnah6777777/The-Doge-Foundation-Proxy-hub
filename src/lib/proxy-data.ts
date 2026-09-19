export type ProxyLink = { label: string; url: string; note: string };
export type ProxyEntry = {
  id: string;
  name: string;
  icon?: string;
  status: "working" | "partial" | "down";
  description: string;
  links: ProxyLink[];
};

const links = (urls: string[], note = "Alternate access point"): ProxyLink[] =>
  urls.map((url, index) => ({
    label: index === 0 ? "Main link" : `Alternate ${index}`,
    url,
    note: index === 0 ? "Primary access point" : note,
  }));

export const proxyLibrary: ProxyEntry[] = [
  {
    id: "space", name: "Space", icon: "https://void-nine-delta.vercel.app/assets/logo.webp", status: "working",
    description: "A polished space-themed hub with games and a working web proxy.",
    links: links(["https://home.kasihinfo.com/", "https://try.deepee.com/", "https://home.sia-tec.org/"]),
  },
  {
    id: "daydream-x", name: "Daydream X", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjrHp6m1FT3g8GyonO6lplosmaQ5kQHNnAvPCmFYtDIA&s=10", status: "working",
    description: "A lightweight proxy collection with two basic builds and a newer games-enabled version.",
    links: [
      { label: "Main link", url: "https://cdn.jsdelivr.net/gh/TwiLabs/history/dist/index.svg", note: "Basic proxy" },
      { label: "Alternate 1", url: "https://cdn.jsdelivr.net/gh/TwiLabs/art/dist/index.svg", note: "Basic proxy" },
      { label: "Alternate 2", url: "https://51-222-206-184.plesk.page/", note: "New version with games" },
    ],
  },
  {
    id: "truffle", name: "Truffle", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqLJZCYO-UkcHar5H59UZFQnXEVwBTT2Xat2HVhQS5pg&s=10", status: "working",
    description: "A complete games, apps, and proxy destination in one link.",
    links: links(["https://bout.awiki.org/search.html"]),
  },
  {
    id: "definently-science", name: "Definently Science", icon: "https://yt3.googleusercontent.com/L0ZjJHHLfCOysqH_W7dU2tiM6ZEs296MxWbhuafOyufyInXmmvECwo7WfCkakWSCggt-pv59WA=s900-c-k-c0x00ffffff-no-rj", status: "partial",
    description: "A lesson-styled hub with a large game library and a basic proxy.",
    links: links(["https://platform.geometrylesson.com/"]),
  },
  {
    id: "terbium", name: "Terbium", icon: "https://avatars.githubusercontent.com/u/111026938?v=4", status: "down",
    description: "A browser-based OS interface with apps; its proxy is currently unavailable.",
    links: links(["https://modernphysics.space/"]),
  },
  {
    id: "selenite", name: "Selenite", icon: "https://play-lh.googleusercontent.com/dOhyXRF1Zj5iEDZbd6yZkGIv-xlrsJ0D7UMC1UjMHaW7TYiG-XLmQvdFnEEParIpnio=w256", status: "working",
    description: "A dependable games and web-access hub backed by a wide set of alternate domains.",
    links: links(["https://selenite-6668.logans.projectbyod.com/", "https://selenite-2024.logan.learningatschool.website/", "https://selenite-2622.logan.read.beer/", "https://selenite-1155.a2zrealty.biz/", "https://selenite-3449.logan.dumb.today/", "https://selenite-1155.a2zrealty.biz/"]),
  },
  {
    id: "cherri", name: "Cherri", icon: "https://static.vecteezy.com/system/resources/previews/006/018/527/non_2x/simple-modern-flat-fresh-red-cherry-shape-for-icon-idea-vector.jpg", status: "working",
    description: "A fast proxy build with multiple CDN mirrors for reliable access.",
    links: links(["https://bull-eats-cherris.dr8.ca/", "https://bull.noble-house.tk/", "https://originfastly.jsdelivr.net/gh/lurexh/svg@098d8ed5073d8ac7ce889a9d3864c45f06b36ebb/index.svg", "https://githubraw.com/lurexh/svg/4a69079ac75b860e5b3b7dc27484d9d8856108fa/index.svg", "https://quantil.jsdelivr.net/gh/lurexh/svg@86290341d961624f48e321fe6d0870518d705d8f/index.svg", "https://rawcdn.githack.com/lurexh/svg/95230c980d066c1ccdd32910f4dbffb38aebd54e/index.svg", "https://cdn.jsdmirror.com/gh/lurexh/svg@c37304258c86d594eeabcabcbb738b1ffd91108e/index.svg"]),
  },
  {
    id: "boredom-v3", name: "Boredom V3", icon: "https://media.istockphoto.com/id/1250020534/photo/neon-3d-font-blue-and-pink-neon-light-3d-rendering-letter-b.jpg?s=1024x1024&w=is&k=20&c=_A3Mkq51gMz65YwQw4Afv87de7oFkBbsn6E0z-Vd2Bo=", status: "working",
    description: "Version three of the Boredom hub, offering games and browsing through three mirrors.",
    links: links(["https://sciguide.global.ssl.fastly.net/", "https://boredonasndkf.freetls.fastly.net/", "https://scoolhackas.cherri.twilightparadox.com/"]),
  },
  {
    id: "void-network", name: "Void Network", icon: "https://media.istockphoto.com/id/825109764/vector/rectangular-beveled-metal-font-letter-v.jpg?s=612x612&w=0&k=20&c=VSVt13ETt03F561Je_-7poGC2eYra1DgyCc1QFVcuVc=", status: "working",
    description: "A broad network of game and proxy mirrors with several backup domains.",
    links: links(["https://logan.smartz.wiki/classes/geometry/unit-8-NDg2MTg4Y2VwLlJVTEZ4RkE0cVE0cQ?g=710", "https://bcsdny.com.de/", "https://vng.lol/", "https://network.mantaaway.com/", "https://much.jussive.abrdns.com/", "https://thelongislandschoolsystem.com/"]),
  },
  {
    id: "velara", name: "Velara", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSSHRbqPeZn1j9mXRQZ58CHZqvpxH75s2V47z_SdNERcmkmXrt1tViBZY&s=10", status: "working",
    description: "A versatile browser hub with a deep lineup of alternate domains.",
    links: links(["https://cdn.mathermatters.org/", "https://student-8029.lllogan.website/", "https://student-8250.logans.projectbyod.com/", "https://sunsett.cc/", "https://086dev.kjnadfnjfkjasnkjasdkjsadkj.undern.freeddns.org/", "https://velara.gparente.net.br/", "http://scoolhackas.velara.chickenkiller.com/"]),
  },
  {
    id: "fern", name: "Fern", icon: "https://avatars.githubusercontent.com/u/112173820?s=200&v=4", status: "working",
    description: "A clean utility hub distributed across cloud storage and independent mirrors.",
    links: links(["https://bulledu.s3.us-east-1.amazonaws.com/index.html", "https://s3.amazonaws.com/macrologoat/index.html", "https://s3.amazonaws.com/readvc/index.html", "https://stupid6thgraders.imaginelearningmath.com/", "https://penguin.pound4poundmma.ca/", "https://securly.com.philosophyonline.org/"]),
  },
  {
    id: "shadow-v3", name: "Shadow v3", icon: "https://avatars.githubusercontent.com/u/136856517?s=280&v=4", status: "working",
    description: "A streamlined third-generation proxy with a strong set of classroom-style mirrors.",
    links: links(["https://clearastronomynotes.laravel.mx/", "https://reviewmath.toomanyanimals.ca/", "https://dailyalgebrapractice.shiwo.org/", "https://nimblephysics.berugy.hu/", "https://studycalculus.tynis.org/", "https://smartsatacademy.ngr.ninja/"]),
  },
  {
    id: "reds-exploit-corner", name: "Reds Exploit Corner", icon: "https://img.magnific.com/premium-vector/red-letter-r-is-black-background_1146158-90.jpg?semt=ais_hybrid&w=740&q=80", status: "partial",
    description: "A compact utility corner with one live route and one backup route.",
    links: links(["https://live.fumcennis.org/", "https://dead.natkajoyas.cl/"]),
  },
  {
    id: "truffled", name: "Truffled", status: "working",
    description: "A multi-domain fork of the Truffle experience with several practical fallbacks.",
    links: links(["https://drpepper.kwgranitecountertops.com/", "https://truffled.cv/", "https://spanish-class.scottbaptist.com/", "https://september.pound4poundmma.ca/", "https://gucci-morty.americansolidarityparty.net/", "https://shar.centrodiagnosticogenetico.com/"]),
  },
  {
    id: "dogeub", name: "DOGEUB", icon: "https://static.wikia.nocookie.net/rfti/images/0/09/Cheemsdog.png/revision/latest?cb=20221121101639", status: "working",
    description: "A community favorite with the classic v4 build and newer v5 mirrors.",
    links: [
      { label: "Main link", url: "https://dogefrokbro.vercel.app/", note: "Old v4" },
      ...links(["https://api-www.studycare.help/", "https://storage.googleapis.com/grammarly/index.html", "https://history.worksheets.krepche.com/", "https://testingcf.jsdelivr.net/gh/dogeub/-/index.svg", "https://edu.ronginbari.com/"]).map((link, index) => ({ ...link, label: `Alternate ${index + 1}`, note: "New v5 mirror" })),
    ],
  },
  {
    id: "frogies-arcade", name: "Frogies Arcade", icon: "https://avatars.githubusercontent.com/u/115168315?v=4", status: "working",
    description: "An arcade-first collection with games and several independent access points.",
    links: links(["https://health.keycommres.org/", "https://frogiesarcade.xyz/", "https://frog.hpsschools.org/", "https://denisonisd.org/", "https://phi.bz/", "https://play.frogiee1.net/"]),
  },
  {
    id: "tung-tung-ub", name: "Tung Tung UB", icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxxAx03kigcJD-lDRjnyyn9Xt8aAavwBMqTPPxJVEShqFgSnVDk9tsl0Fm&s=10", status: "working",
    description: "A fast unblocked browser collection with a matching family of backup sites.",
    links: links(["https://triplet.gandhinagar.com/", "https://sirmathgood.art-motel.com/", "https://pcroomsir.art-motel.com", "https://nickmathsir.art-motel.com", "https://laptoppcok.art-motel.com", "https://engagesirok.art-motel.com"]),
  },
  {
    id: "strawberri", name: "Strawberri", icon: "https://png.pngtree.com/png-clipart/20230504/ourmid/pngtree-isolated-strawberry-on-white-background-png-image_7082688.png", status: "working",
    description: "A playful strawberry-themed access hub with five coordinated mirrors.",
    links: links(["https://thankssir.srivaishnavam.org.au/", "https://siryessir.srivaishnavam.org.au/", "https://oksirtkhmm.srivaishnavam.org.au/", "https://goodmathsirok.srivaishnavam.org.au/", "https://goodmathsir.srivaishnavam.org.au/"]),
  },
  {
    id: "study-hub", name: "Study Hub", icon: "https://media.istockphoto.com/id/1302140271/vector/square-academic-cap-simple-graduate-cap-silhouette-icon.jpg?s=612x612&w=0&k=20&c=v9DUoWgY1p8lbRPobWcWzG1BPl1Bcgk5IonsJgpWcB4=", status: "working",
    description: "A school-styled collection with a primary portal and four alternate routes.",
    links: links(["https://ultramathtech.parcomunica.com/", "https://treetreetree.parcomunica.com/", "https://mrkultragood.parcomunica.com/", "https://homeworkmath.parcomunica.com/", "https://googmamdir.parcomunica.com/"]),
  },
  {
    id: "catclass", name: "Catclass", icon: "https://e7.pngegg.com/pngimages/311/97/png-clipart-pusheen-cat-pixel-art-graphics-pusheen-drawings-text-rectangle-thumbnail.png", status: "working",
    description: "A cat-themed classroom hub mirrored across cloud storage and CDN endpoints.",
    links: links(["https://catclassgoat.s3.amazonaws.com/index.html", "https://catclassgoat.s3.us-east-1.amazonaws.com/index.html", "https://catclassgoat.s3-external-1.amazonaws.com/index.html", "https://classroomc47c1455.s3.us-east-1.amazonaws.com/index.html", "https://fastly.jsdelivr.net/gh/task4z/classroom-15x@main/images/3c85abb1a1/logo.svg", "https://cdn.jsdmirror.com/gh/task4z/classroom-15x/images/3c85abb1a1/logo.svg"]),
  },
  {
    id: "aeos-v4", name: "Aeos V4", icon: "https://thumbs.dreamstime.com/b/cool-letter-font-made-style-84595587.jpg", status: "working",
    description: "A fourth-generation browser build distributed through multiple raw-file and CDN mirrors.",
    links: links(["https://cdn.jsdelivr.net/gh/dorianhagar506-coder/svgbulk-98pslc@main/aeos-v4-1-7jn7.svg", "https://raw.githack.com/dorianhagar506-coder/svgbulk-98pslc@main/aeos-v4-1-7jn7.svg", "https://raw.githubusercontent.com/dorianhagar506-coder/svgbulk-98pslc/main/aeos-v4-2-8tnr.svg", "https://cdn.statically.io/gh/dorianhagar506-coder/svgbulk-98pslc/main/aeos-v4-4-sbm5.svg", "https://rawcdn.jsdelivr.net/gh/dorianhagar506-coder/svgbulk-98pslc@main/aeos-v4-5-5z0m.svg", "https://testingcdn.jsdelivr.net/gh/dorianhagar506-coder/svgbulk-98pslc@main/aeos-v4-7-yy25.svg"]),
  },
  {
    id: "monoxide", name: "Monoxide", icon: "https://img.magnific.com/free-vector/letter-m-monogram-logo-design_474888-7335.jpg?semt=ais_hybrid&w=740&q=80", status: "working",
    description: "A direct, no-frills proxy collection hosted across five high-speed mirrors.",
    links: links(["https://virginamyhomesweethome.b-cdn.net", "https://freeram.b-cdn.net", "https://buypremiumpls.b-cdn.net", "https://destroyeducation.b-cdn.net", "https://mrrobot.b-cdn.net"]),
  },
];

export const quickLinks = [
  { name: "Aurora", url: "https://au.componentsearch.com/" },
  { name: "Overcloaked", url: "https://over.veranda.co.id/" },
  { name: "Opium", url: "https://cleverlearning.s3.amazonaws.com/index.html" },
  { name: "Solara", url: "https://os.componentsearch.com/" },
  { name: "Rosin", url: "https://pretezels.drbijaytamang.com.np/" },
  { name: "Gust", url: "https://html.cafe/x7aad49cc" },
  { name: "Lyra", url: "https://carl.ronginbari.com/" },
  { name: "Chalkle", url: "https://chalkle.lootline.xyz/" },
  { name: "Nexora", url: "https://noterplusflare06.lucky-mode-2e0e.workers.dev/" },
  { name: "Serum OS", url: "https://s3.amazonaws.com/scholarnook/index.html" },
  { name: "Peak", url: "https://racialequityleadership.com/" },
  { name: "Aether", url: "https://ticalculatoronline.s3.amazonaws.com/index.html?url=https%3A%2F%2Fwww.bing.com%2Fck%2Fa%3F%21%26%26p%3Df65c0f4f8a3a4ff17b1b26db190e8b50629b0f1ea0f312999ae245232b168cf3JmltdHM9MTc4OTYwMzIwMA%26ptn%3D3%26ver%3D2%26hsh%3D4%26fclid%3D06ea4f03-a7fa-6aa2-21e4-58d4a6bd6bf9%26u%3Da1aHR0cHM6Ly93d3cueW91dHViZS5jb20v%26ntb%3D1" },
] as const;