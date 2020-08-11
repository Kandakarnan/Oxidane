const fetch = require("node-fetch");
const jsdom = require("jsdom");
export const loaddamdata = async (damno) => {
 
  let damAPI = {
    ChimoniAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=12",
    ChulliyarAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=17",
    KalladaAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=7",
    KanjirapuzhaAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=20",
    KarapuzhaAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=22",
    KuttiadyAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=6",
    MalampuzhaAPI_URL:
      "https://cors-anywhere.herokuapp.com/https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=1",
    MalankaraAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=26",
    MangalamAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=14",
    MeenkaraAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=16",
    MoolatharaAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=19",
    NeyyarAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=4",
    PambaAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=8",
    PazhassiAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=5",
    PeechiAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=13",
    PeriyarAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=9",
    PothundyAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=15",
    SiruvaniAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=21",
    VazhaniAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=11",
    WalayarAPI_URL:
      "https://cors-anywhere.herokuapp.com/http://idrb.kerala.gov.in/idrb/irrigation_html_disp/main_fr.php?d_cd=18",
  };

  // async function for fetching data from Dam websitesite dom.

  async function damData_async_fetch() {
    // Fetching chimoni data :
    //  let ChimoniResponse = await fetch(damAPI.ChimoniAPI_URL);
    //  let ChimoniData = await ChimoniResponse.text();

    //  // Fetching Chulliyar Data :
    //  let ChulliyarResponse = await fetch(damAPI.ChulliyarAPI_URL);
    //  let ChulliyarData = await ChulliyarResponse.text();

    //  // Fetching Kallada Data :
    //  let KalladaResponse = await fetch(damAPI.KalladaAPI_URL);
    //  let KalladaData = await KalladaResponse.text();

    //  // Fetching Kanjirapuzha Data :
    //  let KanjirapuzhaResponse = await fetch(damAPI.KanjirapuzhaAPI_URL);
    //  let KanjirapuzhaData = await KanjirapuzhaResponse.text();

    //  // Fetching Karapuzha data :
    //  let KarapuzhaResponse = await fetch(damAPI.KarapuzhaAPI_URL);
    //  let KarapuzhaData = await KarapuzhaResponse.text();

    // Fetching Kuttiady Data :
    let KuttiadyResponse = await fetch(damAPI.KuttiadyAPI_URL);
    let KuttiadyData = await KuttiadyResponse.text();

    // Fetching Malampuzha Data :
    let MalampuzhaResponse = await fetch(damAPI.MalampuzhaAPI_URL);
    let MalampuzhaData = await MalampuzhaResponse.text();
    //   console.log(MalampuzhaResponse)
    // Fetching Malankara Data :
    //  let MalankaraResponse = await fetch(damAPI.MalankaraAPI_URL);
    //  let MalankaraData = await MalankaraResponse.text();

    //   // Fetching Mangalam data :
    // let MangalamResponse = await fetch(damAPI.MangalamAPI_URL);
    // let MangalamData = await MangalamResponse.text();

    // // Fetching Meenkara Data :
    // let MeenkaraResponse = await fetch(damAPI.MeenkaraAPI_URL);
    // let MeenkaraData = await MeenkaraResponse.text();

    // // Fetching Moolathara Data :
    // // let MoolatharaResponse = await fetch(damAPI.MoolatharaAPI_URL);
    // // let MoolatharaData = await MoolatharaResponse.text();

    //Fetching Neyyar Data :
    let NeyyarResponse = await fetch(damAPI.NeyyarAPI_URL);
    let NeyyarData = await NeyyarResponse.text();

    //  // Fetching Pamba data :
    //  let PambaResponse = await fetch(damAPI.PambaAPI_URL);
    //  let PambaData = await PambaResponse.text();

    //  // Fetching Pazhassi Data :
    //  let PazhassiResponse = await fetch(damAPI.PazhassiAPI_URL);
    //  let PazhassiData = await PazhassiResponse.text();

    //  // Fetching Peechi Data :
    //  let PeechiResponse = await fetch(damAPI.PeechiAPI_URL);
    //  let PeechiData = await PeechiResponse.text();

    //  // Fetching Periyar Data :
    //  let PeriyarResponse = await fetch(damAPI.PeriyarAPI_URL);
    //  let PeriyarData = await PeriyarResponse.text();

    //   // Fetching Pothundy data :
    // let PothundyResponse = await fetch(damAPI.PothundyAPI_URL);
    // let PothundyData = await PothundyResponse.text();

    // // Fetching Siruvani Data :
    // let SiruvaniResponse = await fetch(damAPI.SiruvaniAPI_URL);
    // let SiruvaniData = await SiruvaniResponse.text();

    // // Fetching Vazhani Data :
    // let VazhaniResponse = await fetch(damAPI.VazhaniAPI_URL);
    // let VazhaniData = await VazhaniResponse.text();

    // // Fetching Walayar Data :
    // let WalayarResponse = await fetch(damAPI.WalayarAPI_URL);
    // let WalayarData = await WalayarResponse.text();

    return {
      //         // ChimoniResult : ChimoniData,
      //         // ChulliyarResult : ChulliyarData,
      //         // KalladaResult : KalladaData,
      //         // KanjirapuzhaResult : KanjirapuzhaData,
      //         // KarapuzhaResult : KarapuzhaData,
      KuttiadyResult: KuttiadyData,
      MalampuzhaResult: MalampuzhaData,
      //         // MalankaraResult : MalankaraData,
      //         // MangalamResult : MangalamData,
      //         // MeenkaraResult : MeenkaraData,
      //                                             // MoolatharaResult : MoolatharaData,
      NeyyarResult: NeyyarData,
      //         // PambaResult : PambaData,
      //         // PazhassiResult :PazhassiData,
      //         // PeechiResult : PeechiData,
      //         // PeriyarResult : PeriyarData,
      //         // PothundyResult : PothundyData,
      //         // SiruvaniResult : SiruvaniData,
      //         // VazhaniResult : VazhaniData,
      //         // WalayarResult : WalayarData
    };
  }

  // // Processing on Dom Fetching result

  let a1;
  //     // Calling async function
  await damData_async_fetch().then((result) => {
    //  Storing Rsult in Array
    let resultArray = [
      //    result.ChimoniResult,
      //    result.ChulliyarResult,
      //    result.KalladaResult,
      //    result.KanjirapuzhaResult,
      //    result.KarapuzhaResult,
      result.KuttiadyResult,
      result.MalampuzhaResult,
      //    result.MalankaraResult,
      //    result.MangalamResult,
      //    result.MeenkaraResult,
      result.NeyyarResult,
      //    result.PambaResult,
      //    result.PazhassiResult,
      //    result.PeechiResult,
      //    result.PeriyarResult,
      //    result.PothundyResult,
      //    result.SiruvaniResult,
      //    result.VazhaniResult,
      //    result.WalayarResult,
    ];

    let fetchingDOM = [];
    // Iterating result through JSDOM
    for (let i = 0; i < resultArray.length; i++) {
      fetchingDOM.push(new jsdom.JSDOM(resultArray[i]));
    }

    //  Storing per day water level
    let dateWiseWaterLevel = [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ];

    let domlength = [];
    let calculatedlength = [];

    //  Iterating table data through loop and checking whether last 5 days of data is present or not.
  
    for (let i = 0; i < fetchingDOM.length; i++) {
      domlength.push(
        fetchingDOM[i].window.document.querySelector("table").rows.length
      );
      calculatedlength.push(6 - domlength[i]);

      if (
        fetchingDOM[i].window.document.querySelector("table").rows.length == 6
      ) {
        dateWiseWaterLevel[i].push(
          parseFloat(
            fetchingDOM[i].window.document.querySelector("table").rows[1]
              .cells[2].innerHTML
          )
        );
      } else {
        for (let r = 1; r <= 1; r++) {
          dateWiseWaterLevel[i].push(
            parseFloat(
              fetchingDOM[i].window.document.querySelector("table").rows[1]
                .cells[2].innerHTML
            )
          );
        }
      }
    }

    // Fetching FRL 

    let FRLdata = [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ];
//Fetching FRL 
    for (let j = 1; j < 2; j++) {
      for (let i = 0; i < fetchingDOM.length; i++) {
        let FRL = fetchingDOM[i].window.document.querySelectorAll("label")[4]
          .innerHTML;

        FRLdata[i].push(parseFloat(FRL.slice(1, -1)));
      }
    }

    console.log(dateWiseWaterLevel[damno]);
    console.log(FRLdata[damno]);
    
   //Dam waterlevel percentage
    let percentage = (dateWiseWaterLevel[damno] / FRLdata[damno]) * 100;
    a1 = percentage;
  });

  return a1;
};
