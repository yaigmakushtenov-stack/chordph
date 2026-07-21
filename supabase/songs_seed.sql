-- Chord.ph shared song library — run once in the Supabase SQL Editor.
create table if not exists public.songs (
    id text primary key,
    title text not null,
    artist text,
    "key" text,
    tempo int,
    feel text,
    chart text not null,
    updated_at timestamptz not null default now()
);

alter table public.songs enable row level security;
drop policy if exists "songs_public_read" on public.songs;
create policy "songs_public_read" on public.songs for select using (true);

insert into public.songs (id, title, artist, "key", tempo, feel, chart) values
('glorious', 'Glorious', 'Victory Worship', 'G', 72, 'Moderate Worship', '[Intro]
G  D  Em  C

[Verse 1]
G              D
You are glorious, Lord
Em             C
Worthy of all praise

[Chorus]
G         D
Glorious, glorious
Em        C
You are glorious'),
('way-maker', 'Way Maker', 'Sinach', 'B', 68, 'Slow Worship', '[Intro]
B  F#  G#m  E

[Verse 1]
B                F#
You are the way maker
G#m              E
Miracle worker, promise keeper

[Chorus]
B          F#
Way maker, miracle worker
G#m        E
That is who you are'),
('presence', 'Presence', 'His Life Music', 'A', 65, 'Slow Worship', '[Intro]
A  E  F#m  D

[Verse 1]
A              E
In your presence Lord
F#m            D
I find everything I need

[Chorus]
A         E
Your presence, your presence
F#m       D
Is all I need'),
('lilim', 'Lilim', 'Victory Worship', 'E', 70, 'Slow Worship', '[Intro]
E  G#m  A  C#m  B

[Verse 1]
E           G#m       A
Panginoon ang nais ko
C#m        B        E
Kagandahan Mo ay pagmasdan
G#m              A
Ang pag-ibig Mo saki''y tugon
C#m       B      F#m
Kailanma''y ''di pababayaan

[Pre-Chorus]
G#m      A      F#m
Sa ''Yo lamang matatagpuan
G#m      A      B
Sa ''Yo lamang

[Chorus]
E          G#m
Mananatili sa Iyong lilim
A          C#m       B
At sasambahin ka sa dakong lihim
E          G#m
Mananatili sa Iyong lilim
A          C#m       B
Nang masumpungan ka sa dakong lihim

[Bridge]
A       B       C#m
Ang pagpuri ko ay tanging sa ''Yo
E     G#m    A
Sa ''Yo lamang iniaalay
B       C#m
O Panginoon ang puso ko''y
E
Sa ''Yo magpakailanman'),
('heart-of-worship', 'Heart of Worship', 'Matt Redman', 'D', 74, 'Slow Worship', '[Verse 1]
D              A
When the music fades
Em                  A
All is stripped away and I simply come
D              A
Longing just to bring
Em             A
Something that''s of worth that will bless Your heart

[Pre-Chorus]
Em      D       A
I''ll bring You more than a song
Em      D       A
For a song in itself is not what You have required

[Chorus]
D              A
I''m coming back to the heart of worship
Em             G    A    D
And it''s all about You it''s all about You Jesus
D              A
I''m sorry Lord for the thing I''ve made it
Em             G    A    D
When it''s all about You all about You Jesus

[Verse 2]
D              A
King of endless worth
Em                  A
No one could express how much You deserve
D              A
Though I''m weak and poor
Em             A
All I have is Yours every single breath'),
('take-it-all', 'Take It All', 'Hillsong Worship', 'B', 140, 'Upbeat Praise', '[Intro]
B

[Verse 1]
B
Searching the world the lost will be found
In freedom we live as one we cry out
You carried the cross You died and rose again
My God I''ll only ever give my all

[Verse 2]
B                    G#m
You sent Your Son from heaven to earth
                     E
You delivered us all it''s eternally heard
B
I searched for truth and all I found was You
My God I''ll only ever give my all

[Chorus]
B           F#
Jesus we''re livin'' for Your name
G#m              E
We''ll never be ashamed of You
B           F#
Our praise and all we are today
C#m
Take take take it all take take take it all

[Bridge]
C#m   G#m   F#   E
Running to the One who heals the blind
C#m   G#m   F#
Following the shining light
C#m   G#m   F#   E
In Your hands the power to save the world
B
And my life'),
('god-is-here', 'God Is Here', 'Darlene Zschech', 'D', 80, 'Moderate Worship', '[Intro]
D

[Verse 1]
D       G    D
Open our eyes Lord we want to see You
A       G    Em
Open our hearts Lord we want to know You
D       G    D
Open our ears Lord we need to hear You
A       G    D
Jesus be revealed Jesus be revealed

[Chorus]
D    A    Bm   D
God is here God is here God is here He is able
D    G    Bm   A
We draw near to see Jesus face to face
D    A    Bm   D
God is here God is here God is here He is faithful
F#m  Bm   G    D
We draw near to see Jesus Oh Jesus be revealed

[Verse 2]
D       G    D
Open the gates Lord reveal Your glory
A       G    Em
Open the nations establish Your Kingdom
D       G    D
Open the Heavens pour out Your Spirit
A       G    D
Jesus be revealed Jesus be revealed

[Bridge]
G    Bm
Holy we cry holy
Em   G    A
Hallelujah God is here
G    Bm
Holy we cry holy
Em   D
Hallelujah God is here'),
('lead-me-to-the-cross', 'Lead Me to the Cross', 'Hillsong United', 'D', 70, 'Slow Worship', '[Intro]
Bm  A  G  D  A

[Verse 1]
Bm    A      G
Savior I come quiet my soul
D       A
Remember redemption''s hill
Bm    A      G
Where Your blood was spilled
D       A
For my ransom

[Pre-Chorus]
Em        A
Everything I once held dear
Bm    A      G
I count it all as loss

[Chorus]
G       D    A
Lead me to the cross where Your love poured out
G       D    A
Bring me to my knees Lord I lay me down
Bm    G       D    A
Rid me of myself I belong to You
Em
Oh lead me
G    A    Bm
Lead me to the cross

[Verse 2]
Bm    A      G
You were as I tempted and tried human
D       A
The Word became flesh
Bm    A      G
Bore my sin and death
D       A
Now You''re risen

[Bridge]
D    G    A
To Your heart
D    G    A
To Your heart
D    G    A
Lead me to Your heart
D    G    A
Lead me to Your heart'),
('oceans', 'Oceans', 'Hillsong United', 'D', 71, 'Slow Worship', '[Intro]
Bm  A  D  A  G

[Verse 1]
Bm      A       D
You call me out upon the waters
A              G
The great unknown where feet may fail
Bm      A       D
And there I find You in the mystery
A              G
In oceans deep my faith will stand

[Chorus]
G       D    A
I will call upon Your Name
G       D    A
And keep my eyes above the waves
Bm   G
When oceans rise
D       A
My soul will rest in Your embrace
G    A    Bm
For I am Yours and You are mine

[Verse 2]
Bm      A       D
Your grace abounds in deepest waters
A              G
Your sovereign hand will be my guide
Bm      A       D
Where feet may fail and fear surrounds me
A              G
You''ve never failed and You won''t start now

[Bridge]
Bm          G
Spirit lead me where my trust is without borders
D
Let me walk upon the waters
A
Wherever You would call me
Bm          G
Take me deeper than my feet could ever wander
D
And my faith will be made stronger
A
In the presence of my Saviour'),
('endless-praise', 'Endless Praise', 'Planetshakers', 'D', 130, 'Upbeat Praise', '[Intro]
Bm  D  A  G

[Verse 1]
Bm      D    A      G
You are God and we lift You up
Bm      D    A      G
We keep singing we keep praising
Bm      D    A      G
We won''t stop giving all we got
Bm      D    A      G
Cause You''re worthy of all glory

[Pre-Chorus]
A    Bm   G    D
Oh there is no other You are forever Lord over all
Bm   G    D
There''s nobody like You no one beside You

[Chorus]
D    G    A    Bm
To You let endless praise resound
D    G    A    D
Every night and day and with no delay
D    G    A    D
Let endless praise resound

[Bridge]
G
We lift You up up up
Bm
We are giving You our love love love
G
For everything You''ve done done done
Bm
We give You all the praise'),
('this-is-our-time', 'This Is Our Time', 'Planetshakers', 'D', 130, 'Upbeat Praise', '[Hook]
A  E  F#m  D

[Verse]
F#m
Here and now making loud at the top of our lungs
There''s a sound breaking out Lord for all that you''ve done

[Pre-Chorus]
A         E
And now we''re turning our
D
Turning our hearts to You
A         E
And no we''ll never stop
D
Never stop loving You

[Chorus]
A    E    F#m  D
This is our time this is our season
A    E    F#m  D
We lift our voice we give You all the glory
A    E    F#m  D
Every heart and every nation
A    E    F#m  D
We are Yours forever

[Bridge]
F#m  E    A    D
We are the generation that will seek Your face
F#m  E    A    D
We are the generation we will take our place'),
('turn-it-up', 'Turn It Up', 'Planetshakers', 'E', 126, 'Upbeat Praise', '[Intro]
E  A  C#m  B

[Verse 1]
E       A      C#m   B
You are here as we lift You up
E       B
You are riding on our praise
E       A      C#m   B
Be enthroned over everything
E       B
You are seated in our praise

[Pre-Chorus]
C#m          B
This is prophetic I can feel it in the air
A                    B
We lift our praise and You change the atmosphere
C#m          B
With hearts open now everybody singing out
A
I am free

[Chorus]
E       B
Turn it up this sound of praise
A
Make it louder than any other
E       B    C#m  A  B
Lift Him up and shout His name over all

[Verse 2]
E       A      C#m   B
As we praise I can feel the change
E       B
As Your presence now invades
E       A      C#m   B
Hear the sound of the broken chains
E       B
Prison doors are giving way

[Bridge]
E
Our praise goes up
A
Your rain comes down
C#m      B    E    A
With shouts of praise we celebrate
C#m      B
You are riding on our praise
A
Oh Lord'),
('dance', 'Dance', 'Planetshakers', 'E', 128, 'Upbeat Praise', '[Intro]
C#m  B  E  A

[Verse 1]
C#m  B    E     A
I''m alive cause Jesus gave me life
C#m  B    E     A
He opened up my eyes
C#m  B    E     A
I can see clearly now

[Pre-Chorus]
C#m  B    E     A
Oh everybody dance now oh

[Chorus]
C#m  B    E     A
Everybody give it up for Jesus
C#m  B    E     A
Give Him glory for He has redeemed us
C#m  B    E     A
Everybody give it up for Jesus
C#m  B    E     A
Praise His Name

[Verse 2]
C#m  B    E     A
My desire is to lift You higher
C#m  B    E     A
It''s only burning brighter
C#m  B    E     A
This passion inside of me

[Bridge]
C#m  B    E     A
This praise is bursting out
C#m  B    E     A
I can''t contain it now
C#m  B    E     A
This praise is bursting out
C#m  B
Out out out')
on conflict (id) do update set title=excluded.title, artist=excluded.artist, "key"=excluded."key", tempo=excluded.tempo, feel=excluded.feel, chart=excluded.chart, updated_at=now();
