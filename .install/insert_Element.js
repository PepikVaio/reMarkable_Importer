const { PDFDocument, PDFString, rgb, PDFName } = require('pdf-lib');
const fs = require('fs');
const fontkit = require('fontkit');

// Poznámky:
// *********

// Spuštění js na iPhone přes zkratku
// Je potřeba upravit cestu node poté se přesunout do složky s js a spustit js
// export PATH=$PATH:/home/root/.local/share/node-v22.12.0-linux-armv7l/bin cd /home/root/insert_Element && node insert_Element.js

// Spuštění js na iMac v terminálu (jak pro iMac, tak pro reMarkable přes ssh @root:)
// Stačí se jen přesunout do složky se scriptem a spustit script s parametrem node (mohu spojit příkazy přes &&)
// cd insert_Element
// node insert_Element.js

// Zastavení procesu
//process.exit();



//    _                 _      _      _        
//   | |   ___  __ _ __| |  __| |__ _| |_ __ _ 
//   | |__/ _ \/ _` / _` | / _` / _` |  _/ _` |
//   |____\___/\__,_\__,_| \__,_\__,_|\__\__,_|
//                                             

// Načtení parametrů z externího *json souboru
const load_Data = JSON.parse(fs.readFileSync('load_Data.json'));



//    __  __      _                 _             
//   |  \/  |__ _(_)_ _   __ ____ _| |_  _ ___ ___
//   | |\/| / _` | | ' \  \ V / _` | | || / -_|_-<
//   |_|  |_\__,_|_|_||_|  \_/\__,_|_|\_,_\___/__/
//                                                

// Vypočitá se později v kódu
let element_Href_Type; // (number, webpage)


//    ___                          _             
//   | _ \__ _ __ _ ___  __ ____ _| |_  _ ___ ___
//   |  _/ _` / _` / -_) \ V / _` | | || / -_|_-<
//   |_| \__,_\__, \___|  \_/\__,_|_|\_,_\___/__/
//            |___/                              

// Vypočitá se později v kódu
let   page_Width;
let   page_Height;


//     ___     _                    _             
//    / __|___| |___ _ _  __ ____ _| |_  _ ___ ___
//   | (__/ _ \ / _ \ '_| \ V / _` | | || / -_|_-<
//    \___\___/_\___/_|    \_/\__,_|_|\_,_\___/__/
//                                                

// Barvy pomocí RGB (červená, zelená, modrá, ...)
const colors = {
  white: rgb(1, 1, 1),
  red:   rgb(1, 0, 0),
  green: rgb(0, 1, 0),
  blue:  rgb(0, 0, 1),
  black: rgb(0, 0, 0),
  gray:  rgb(0.5, 0.5, 0.5),
};


//    ___ _ _                _             
//   | __(_) |___  __ ____ _| |_  _ ___ ___
//   | _|| | / -_) \ V / _` | | || / -_|_-<
//   |_| |_|_\___|  \_/\__,_|_|\_,_\___/__/
//                                         

// Cesta k *pdf souboru (přímo)
//const file_Path = "new_Pdf.pdf";
//const file_Path = "/home/root/.local/share/remarkable/xochitl/ec11305b-55a6-4c90-8975-c5c4f6c7a220.pdf";
										 
// Cesta k *pdf souboru (z environmentální proměnné - find_File.sh)
//const file_Path = process.env.FILE_PATH;

// Cesta k *pdf souboru
// Používám proměnnou z *json souboru

//    _____        _              _             
//   |_   _|____ _| |_  __ ____ _| |_  _ ___ ___
//     | |/ -_) \ /  _| \ V / _` | | || / -_|_-<
//     |_|\___/_\_\\__|  \_/\__,_|_|\_,_\___/__/
//                                              

// Převod z textu na číslo, protože v apple zkratkách ukládám do json souboru jako text
// Pokud spouštím z oficiálních json (nevytvořených ve zkratkách), tak mohu smazat
// Ale musím před název proměnné v kódu přidat "load_Data."
const text_Text_Padding       = Number(load_Data.text_Text_Padding);
const text_Text_Position_Top  = Number(load_Data.text_Text_Position_Top);
const text_Text_Position_Left = Number(load_Data.text_Text_Position_Left);
const text_Font_Size          = Number(load_Data.text_Font_Size);
const text_Line_Width         = Number(load_Data.text_Line_Width);
const text_Border_Width       = Number(load_Data.text_Border_Width);
		
		
// Proměnné pro font
const text_Font_Correction_Leading = text_Font_Size * 0.435; // Korekce velikosti písma / Písmo se počítá i s mezerou mezi řádky, korekce ji zruší

// Vypočitá se později v kódu
let text_Text_Width;
let text_Text_Height;
let text_Font_Name;


//    _____ _              _                              _             
//   |_   _(_)_ __  ___ __| |_ __ _ _ __  _ __  __ ____ _| |_  _ ___ ___
//     | | | | '  \/ -_|_-<  _/ _` | '  \| '_ \ \ V / _` | | || / -_|_-<
//     |_| |_|_|_|_\___/__/\__\__,_|_|_|_| .__/  \_/\__,_|_|\_,_\___/__/
//                                       |_|                            

// Převod z textu na číslo, protože v apple zkratkách ukládám do json souboru jako text
// Pokud spouštím z oficiálních json (nevytvořených ve zkratkách), tak mohu smazat
// Ale musím před název proměnné v kódu přidat "load_Data."
const timestamp_Text_Padding_Bottom = Number(load_Data.timestamp_Text_Padding_Bottom);
const timestamp_Text_Position_Top   = Number(load_Data.timestamp_Text_Position_Top);
const timestamp_Text_Position_Right = Number(load_Data.timestamp_Text_Position_Right);
const timestamp_Font_Size           = Number(load_Data.timestamp_Font_Size);
const timestamp_Line_Width          = Number(load_Data.timestamp_Line_Width);
const timestamp_Line_Position_Right = Number(load_Data.timestamp_Line_Position_Right);
const timestamp_Line_Position_Left  = Number(load_Data.timestamp_Line_Position_Left);
		
// Proměnné pro font
const timestamp_Font_Size_Time               = timestamp_Font_Size * 0.7;        // Změna v procentech velikosti písma pro čas (pouze timestamp)
const timestamp_Font_Correction_Leading_Date = timestamp_Font_Size_Time * 0.435; // Korekce velikosti písma / Písmo se počítá i s mezerou mezi řádky, korekce ji zruší
const timestamp_Font_Correction_Leading_Time = timestamp_Font_Size_Time * 0.435; // Korekce velikosti písma / Písmo se počítá i s mezerou mezi řádky, korekce ji zruší

// Vypočitá se později v kódu
let timestamp_Text_Width_Date;
let timestamp_Text_Width_Time;
let timestamp_Text_Height_Date;
let timestamp_Text_Height_Time;
let timestamp_Font_Name;


//    ___                                _             
//   |_ _|_ __  __ _ __ _ ___  __ ____ _| |_  _ ___ ___
//    | || '  \/ _` / _` / -_) \ V / _` | | || / -_|_-<
//   |___|_|_|_\__,_\__, \___|  \_/\__,_|_|\_,_\___/__/
//                  |___/                              

// Převod z textu na číslo, protože v apple zkratkách ukládám do json souboru jako text
// Pokud spouštím z oficiálních json (nevytvořených ve zkratkách), tak mohu smazat
// Ale musím před název proměnné v kódu přidat "load_Data."
const image_Image_Size          = Number(load_Data.image_Image_Size);
const image_Image_Position_Top  = Number(load_Data.image_Image_Position_Top);
const image_Image_Position_Left = Number(load_Data.image_Image_Position_Left);

// Vypočitá se později v kódu
let image_Image_Width;
let image_Image_Height;



//    __  __      _         __              _   _          
//   |  \/  |__ _(_)_ _    / _|_  _ _ _  __| |_(_)___ _ _  
//   | |\/| / _` | | ' \  |  _| || | ' \/ _|  _| / _ \ ' \ 
//   |_|  |_\__,_|_|_||_| |_|  \_,_|_||_\__|\__|_\___/_||_|
//    ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___ ___  
//   |___|___|___|___|___|___|___|___|___|___|___|___|___| 

// Funkce pro načtení a zpracování *pdf souboru
async function load_Pdf() {
  try {
    // Načtení *pdf dokumentu k upravení
		const pdf_Document = await PDFDocument.load(fs.readFileSync(load_Data.file_Path));

    // Registrace fontkit pro práci s vlastními fonty
    pdf_Document.registerFontkit(fontkit);

    // Načteme a vložíme vlastní font
    text_Font_Name = await pdf_Document.embedFont(fs.readFileSync(load_Data.text_Font_Path));
    timestamp_Font_Name = await pdf_Document.embedFont(fs.readFileSync(load_Data.timestamp_Font_Path));

    // Zjistíme počet stránek
    const count_Pages = pdf_Document.getPages();

		// Vybereme požadovanou stránku a stránku s cílem odkazu
		const select_Page = count_Pages[load_Data.element_Content_Target - 1];
		let select_Page_Link;

		// Regulární výraz pro kontrolu, zda se jedná o URL
		const regular_Url = /^(https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

		// Pokud je to číslo nebo text s číslem na začátku
		let parsed_Number = parseFloat(load_Data.element_Href_Target);
		
		// Kontrola, zda je "element_Href_Target" číslo (a nezahrnuje text jako .cz, .com, ...)
		if (!isNaN(parsed_Number) && !regular_Url.test(load_Data.element_Href_Target)) {
			// Je to číslo
			element_Href_Type = "number";
			select_Page_Link = count_Pages[load_Data.element_Href_Target - 1].ref
		} else if (regular_Url.test(load_Data.element_Href_Target)) {
			// Je to webová stránka
			element_Href_Type = "webpage";
			select_Page_Link = "https://" + load_Data.element_Href_Target + "/";
		} else {
			// Nothing
			element_Href_Type = "";
		}

    // Získání rozměrů stránky
    page_Height = select_Page.getHeight();
    page_Width = select_Page.getWidth();
		
		// Přidání obsahu
		switch (load_Data.element_Content) {
  	case "text":
    	add_Text(select_Page);
    	break;
  	case "timestamp":
    	add_Timestamp(select_Page);
    	break;
  	case "picture":
    	// Přidání obrázku
    	await add_Image(pdf_Document, select_Page);
    	break;
  	default:
    	console.log("No element_Content (text, picture, timestamp).");
		}


		// Kontrola, zda se má přidat odkaz
		if (load_Data.element_Content === "timestamp") {
			// No action needed
		} else if (element_Href_Type !== "") {
			// Přidání odkazu
    	add_Link(pdf_Document, select_Page, select_Page_Link);
		} else {
			console.log("No element_Href_Target (number, webpage).");
		}

    // Uložení souboru pod stejným názvem
		fs.writeFileSync(load_Data.file_Path, await pdf_Document.save());
		console.error("Hotovo!");
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

//    __  __      _   _       __              _   _             
//   |  \/  |__ _| |_| |_    / _|_  _ _ _  __| |_(_)___ _ _  ___
//   | |\/| / _` |  _| ' \  |  _| || | ' \/ _|  _| / _ \ ' \(_-<
//   |_|  |_\__,_|\__|_||_| |_|  \_,_|_||_\__|\__|_\___/_||_/__/
//                                                              

// Funkce pro převod milimetrů na jednotky odpovídající reMarkable obrazovce
function to_Display_Units(input) {
  input += 1;                  // Korekce +1 (přesnost na obrazovce reMarkable)
  return (input * 226) / 25.4; // Výpočet v pixelech podle PPI reMarkable
}

//     ___         _           _      __              _   _             
//    / __|___ _ _| |_ ___ _ _| |_   / _|_  _ _ _  __| |_(_)___ _ _  ___
//   | (__/ _ \ ' \  _/ -_) ' \  _| |  _| || | ' \/ _|  _| / _ \ ' \(_-<
//    \___\___/_||_\__\___|_||_\__| |_|  \_,_|_||_\__|\__|_\___/_||_/__/
//                                                                      

// Funkce pro vykreslení textu
function add_Text(select_Page) {

	// Objekt obsahující možnosti dekorací a jejich odpovídající konfigurace (border, line)
	const decoration_Options = {
  	border: { width: text_Border_Width, function: add_Border },
  	line:   { width: null, function: add_Line },
	};

	// Výběr konfigurace na základě zadané dekorace nebo výchozí hodnota (bez dekorace)
	const selected_Decoration = decoration_Options[load_Data.element_Decoration] || {width: 0, function: () => {console.log(`No element_Decoration (${Object.keys(decoration_Options).join(", ")}).`);}};

	// Výpočet šířky a výšky textu
	text_Text_Width = text_Font_Name.widthOfTextAtSize(load_Data.text_Text, text_Font_Size);
	text_Text_Height = text_Font_Name.heightAtSize(text_Font_Size) - text_Font_Correction_Leading + selected_Decoration.width;

	// Spuštění funkce dekorace (pokud existuje)
	selected_Decoration.function(select_Page);

	// Umístění textu od levého horního rohu
	select_Page.drawText(load_Data.text_Text, {
		size: text_Font_Size,
		font: text_Font_Name,
		color: colors[load_Data.text_Font_Color],
		x: to_Display_Units(text_Text_Position_Left) + selected_Decoration.width + text_Text_Padding,     // Horizontální posun od levého okraje
		y: page_Height - to_Display_Units(text_Text_Position_Top) - text_Text_Height - text_Text_Padding, // Vertikální posun od spodního okraje
	});
}

// Funkce pro vložení časového razítka
function add_Timestamp(select_Page) {

  // Získání datumu
	const current_Date = new Date();
  
  // Získání času
	let hours = current_Date.getHours();
  const minutes = current_Date.getMinutes();
  const time_Period = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;

  // Formátování datumu a času
	const formatted_Date = load_Data.timestamp_Text_Before_Date + current_Date.getDate() + '.' + (current_Date.getMonth() + 1) + '.' + current_Date.getFullYear();
  const formatted_Time = load_Data.timestamp_Text_Before_Time + hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + time_Period;

  // Výpočet šířky a výšky textu - Date
  timestamp_Text_Width_Date = timestamp_Font_Name.widthOfTextAtSize(formatted_Date, timestamp_Font_Size);
	timestamp_Text_Height_Date = timestamp_Font_Name.heightAtSize(timestamp_Font_Size) - timestamp_Font_Correction_Leading_Date + timestamp_Line_Width;

  // Výpočet šířky a výšky textu - Time
	timestamp_Text_Width_Time = timestamp_Font_Name.widthOfTextAtSize(formatted_Time, timestamp_Font_Size_Time);
	timestamp_Text_Height_Time = timestamp_Font_Name.heightAtSize(timestamp_Font_Size_Time) - timestamp_Font_Correction_Leading_Time + timestamp_Line_Width;

  // Přidání dekorace kolem textu
	load_Data.element_Decoration === "line" 
  	? add_Line(select_Page) 
  	: console.log("No element_Decoration (line).");
	
	// Umístění textu od pravého horního rohu
  select_Page.drawText(formatted_Date, {
    font: timestamp_Font_Name,
    size: timestamp_Font_Size,
    color: colors[load_Data.timestamp_Font_Color_Date],
    x: page_Width - timestamp_Text_Width_Date - to_Display_Units(timestamp_Text_Position_Right), // Horizontální posun od levého okraje
    y: page_Height - to_Display_Units(timestamp_Text_Position_Top) - timestamp_Text_Height_Date, // Vertikální posun od spodního okraje
  });

  select_Page.drawText(formatted_Time, {
    font: timestamp_Font_Name,
    size: timestamp_Font_Size_Time,
    color: colors[load_Data.timestamp_Font_Color_Time],
    x: page_Width - timestamp_Text_Width_Time - to_Display_Units(timestamp_Text_Position_Right),       // Horizontální posun od levého okraje
    y: page_Height - to_Display_Units(timestamp_Text_Position_Top) - (timestamp_Text_Height_Date * 2), // Vertikální posun od spodního okraje
  });
}

// Funkce pro vložení obrázku
async function add_Image(pdf_Document, select_Page) {

	 try {
		 // Načtení obrázku
		 const load_Image = await pdf_Document.embedPng(fs.readFileSync(load_Data.image_Image_Path));

		 // Výpočet šířky a výšky obrázku
		 image_Image_Width = (load_Image.width * to_Display_Units(image_Image_Size)) / load_Image.width;
		 image_Image_Height = (load_Image.height * to_Display_Units(image_Image_Size)) / load_Image.width;
	
		 // Umístění obrázku od levého horního rohu
		 select_Page.drawImage(load_Image, {
			 width: image_Image_Width,
			 height: image_Image_Height,
			 x: to_Display_Units(image_Image_Position_Left),                                   // Horizontální posun od levého okraje
			 y: page_Height - to_Display_Units(image_Image_Position_Top) - image_Image_Height, // Vertikální posun od spodního okraje
			 opacity: 1,                                                                       // Zachování plné průhlednosti obrázku (pokud je)
		 });
	 } catch (error) {
		 console.error('Error loading image:', error);
	 }
}

// Funkce pro vytvoření odkazu
function add_Link(pdf_Document, select_Page, select_Page_Link) {

	// Objekt obsahující možnosti dekorací a jejich odpovídající konfigurace (text, picture)
	const content_Options = {
  	text: {
  		Rect: [
				to_Display_Units(text_Text_Position_Left),                                                                          // Levý dolní roh na ose X
				page_Height - to_Display_Units(text_Text_Position_Top),                                                             // Levý dolní roh na ose Y
				load_Data.element_Decoration === "border"                                                                           // Pravý horní roh na ose X
					? to_Display_Units(text_Text_Position_Left) + text_Text_Width + (text_Text_Padding * 2) + (text_Border_Width * 2)
					: to_Display_Units(text_Text_Position_Left) + text_Text_Width + (text_Text_Padding * 2),
				load_Data.element_Decoration === "border"                                                                                   // Pravý horní roh na ose Y
					? page_Height - to_Display_Units(text_Text_Position_Top) - text_Text_Height - (text_Text_Padding * 2) - text_Border_Width
					: load_Data.element_Decoration === "line"
						? page_Height - to_Display_Units(text_Text_Position_Top) - text_Text_Height - (text_Text_Padding * 2) - text_Line_Width
						:	page_Height - to_Display_Units(text_Text_Position_Top) - text_Text_Height - (text_Text_Padding * 2)
  		],
		},
  	picture: {
  		Rect: [
				to_Display_Units(image_Image_Position_Left),                                  // Levý dolní roh na ose X
				page_Height - to_Display_Units(image_Image_Position_Top),                     // Levý dolní roh na ose Y
    		to_Display_Units(image_Image_Position_Left) + image_Image_Width,              // Pravý horní roh na ose X
    		page_Height - to_Display_Units(image_Image_Position_Top) - image_Image_Height // Pravý horní roh na ose Y
  		],
		},
	};

	// Vytvoření a registrace anotace
	const link = pdf_Document.context.register(
  	pdf_Document.context.obj({
    	Type: 'Annot',
    	Subtype: 'Link',
    	Rect: content_Options[load_Data.element_Content].Rect, // Pozice na stránce
    	Dest: element_Href_Type === "number"                   // Odkaz na stránku v dokumentu
				? [select_Page_Link, 'XYZ', null, null, null]
				: null,
    	A: element_Href_Type === "webpage"                                 // Odkaz na internetovou stránku
				? {Type: 'Action', S: 'URI',URI: PDFString.of(select_Page_Link)}
				: null,
  	})
	);

	// Přidání anotace na stránku
	select_Page.node.set(PDFName.of('Annots'), pdf_Document.context.obj([link]));
}

//    ___                      _   _            __              _   _             
//   |   \ ___ __ ___ _ _ __ _| |_(_)_ _____   / _|_  _ _ _  __| |_(_)___ _ _  ___
//   | |) / -_) _/ _ \ '_/ _` |  _| \ V / -_) |  _| || | ' \/ _|  _| / _ \ ' \(_-<
//   |___/\___\__\___/_| \__,_|\__|_|\_/\___| |_|  \_,_|_||_\__|\__|_\___/_||_/__/
//                                                                                

// Funkce pro vykreslení obdélníku
function add_Border(select_Page) {

	// Umístění ohraničení od levého horního rohu
	select_Page.drawRectangle({
  	width: text_Text_Width + (text_Text_Padding * 2) + text_Border_Width,
  	height: text_Text_Height + (text_Text_Padding * 2),
  	color: colors[load_Data.text_Border_Background_Color],
  	borderWidth: text_Border_Width,
  	borderColor: colors[load_Data.text_Border_Color],
  	x: to_Display_Units(text_Text_Position_Left) + (text_Border_Width / 2),                                                           // Horizontální posun od levého okraje
		y: page_Height - to_Display_Units(text_Text_Position_Top) - text_Text_Height - (text_Text_Padding * 2) - (text_Border_Width / 2), // Vertikální posun od spodního okraje
	});
}

// Funkce pro vykreslení podtržení
function add_Line(select_Page) {

  // Kontrola, zda se jedná o "timestamp" nebo ne
  const is_Timestamp = load_Data.element_Content === "timestamp";

	// Proměnné pozice od spodního okraje
	const y_Timestamp = page_Height - to_Display_Units(timestamp_Text_Position_Top) - timestamp_Text_Height_Date - timestamp_Text_Padding_Bottom - (timestamp_Line_Width / 2) - timestamp_Text_Height_Date
  const y_Other     = page_Height - to_Display_Units(text_Text_Position_Top) - text_Text_Height - (text_Text_Padding * 2) - (text_Line_Width / 2);

  // Výběr hodnot na základě podmínky
  const line_Color   = is_Timestamp ? colors[load_Data.timestamp_Line_Color]                       : colors[load_Data.text_Line_Color];
  const line_Width   = is_Timestamp ? timestamp_Line_Width                                         : text_Line_Width;
  const line_Start_X = is_Timestamp ? to_Display_Units(timestamp_Line_Position_Left)               : to_Display_Units(text_Text_Position_Left);
  const line_End_X   = is_Timestamp ? page_Width - to_Display_Units(timestamp_Line_Position_Right) : to_Display_Units(text_Text_Position_Left) + (text_Text_Padding * 2) + text_Text_Width;
  const line_Y       = is_Timestamp ? y_Timestamp                                                  : y_Other;

  // Vykreslení čáry
  select_Page.drawLine({
    color: line_Color,
    thickness: line_Width,
    start: {
      x: line_Start_X,
      y: line_Y,
    },
    end: {
      x: line_End_X,
      y: line_Y,
    },
  });
}

//     ___      _ _    __              _   _             
//    / __|__ _| | |  / _|_  _ _ _  __| |_(_)___ _ _  ___
//   | (__/ _` | | | |  _| || | ' \/ _|  _| / _ \ ' \(_-<
//    \___\__,_|_|_| |_|  \_,_|_||_\__|\__|_\___/_||_/__/
//                                                       

// Volání hlavní funkce
load_Pdf();
